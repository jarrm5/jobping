import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus, JobUrgency } from "../../prisma/generated/prisma/enums.ts";
import {
  validateJobCreateRules,
  validateJobUpdateRules,
} from "../domain/jobRules.ts";
import { getCoordinatesFromZip } from "./GeocodingService.ts";

function normalizeUrgency(value: string | null | undefined): string {
  const normalized = String(value ?? JobUrgency.ASAP)
    .trim()
    .toUpperCase();

  if (!Object.values(JobUrgency).includes(normalized as JobUrgency)) {
    throw new Error(`Invalid urgency: ${normalized}`);
  }

  return normalized;
}

async function resolveJobCoordinates(
  prisma: PrismaClient,
  payload: Record<string, any>,
) {
  const zipCode = String(
    payload.zipCode ?? payload.zip_code ?? payload.zipcode ?? "",
  ).trim();

  const zipLocation = await prisma.zipCodeLocation?.findUnique?.({
    where: { zipCode },
  });

  if (zipLocation) {
    return {
      latitude: Number(zipLocation.latitude),
      longitude: Number(zipLocation.longitude),
      city: zipLocation.city ?? null,
      state: zipLocation.state ?? null,
    };
  }

  const geoCoordinates = await getCoordinatesFromZip(zipCode);

  await prisma.zipCodeLocation?.create?.({
    data: {
      zipCode,
      latitude: geoCoordinates.latitude,
      longitude: geoCoordinates.longitude,
      city: geoCoordinates.city ?? null,
      state: geoCoordinates.state ?? null,
    },
  });

  return {
    latitude: Number(geoCoordinates.latitude),
    longitude: Number(geoCoordinates.longitude),
    city: geoCoordinates.city ?? null,
    state: geoCoordinates.state ?? null,
  };
}

export async function postJob(
  prisma: PrismaClient,
  payload: Record<string, any>,
) {
  const nextRuleState = validateJobCreateRules(payload);
  const { latitude, longitude, city, state } = await resolveJobCoordinates(
    prisma,
    payload,
  );

  const data: Record<string, any> = {
    title: String(payload.title ?? "").trim(),
    description: payload.description ?? null,
    urgency: normalizeUrgency(
      payload.urgency ?? payload.urgency ?? JobUrgency.ASAP,
    ),
    status: nextRuleState.status ?? JobStatus.OPEN,
    homeowner_id: Number(payload.homeownerId ?? payload.homeowner_id),
    service_type_id: Number(payload.serviceTypeId ?? payload.service_type_id),
    address: payload.address ?? null,
    city,
    state,
    zip_code: payload.zipCode ?? payload.zip_code ?? null,
    latitude,
    longitude,
    provider_id: nextRuleState.provider_id ?? null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  if (!data.title) {
    throw new Error("Job title is required");
  }

  if (!Number.isFinite(data.homeowner_id)) {
    throw new Error("homeownerId is required");
  }

  if (!Number.isFinite(data.service_type_id)) {
    throw new Error("serviceTypeId is required");
  }

  return prisma.job.create({
    data: data as any,
  });
}

/*
Should only be able to update zip code - then we lookup the coordinates, city, state from zip_code_locations.  If not there then we do the lookup, add the zip code, update the job.
Reuse logic from job posting.
*/

export async function updateJob(
  prisma: PrismaClient,
  jobId: number,
  payload: Record<string, any>,
) {
  const currentJob = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!currentJob) {
    throw new Error("Job not found");
  }

  const data: Record<string, any> = {};

  const nextRuleState = validateJobUpdateRules(currentJob, payload);

  if ("title" in payload) data.title = payload.title;
  if ("description" in payload) data.description = payload.description;
  if ("category" in payload) data.category = payload.category;
  if ("zipcode" in payload || "zipCode" in payload) {
    const { latitude, longitude, city, state } = await resolveJobCoordinates(
      prisma,
      payload,
    );
    data.zip_code = payload.zipcode ?? payload.zipCode;
    data.city = city;
    data.state = state;
    data.latitude = latitude;
    data.longitude = longitude;
  }
  if ("address" in payload) data.address = payload.address;

  if ("serviceTypeId" in payload || "service_type_id" in payload) {
    data.service_type_id = Number(
      payload.serviceTypeId ?? payload.service_type_id,
    );
  }
  if ("homeownerId" in payload || "homeowner_id" in payload) {
    data.homeowner_id = Number(payload.homeownerId ?? payload.homeowner_id);
  }

  if ("status" in payload) {
    data.status = nextRuleState.status;
  }
  if ("providerId" in payload || "provider_id" in payload) {
    data.provider_id = nextRuleState.provider_id;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No valid fields to update");
  }

  data.updated_at = new Date();

  return prisma.job.update({
    where: { id: jobId },
    data,
  });
}
