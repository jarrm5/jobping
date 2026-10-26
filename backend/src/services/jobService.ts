import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus, JobUrgency } from "../../prisma/generated/prisma/enums.ts";
import {
  validateJobCreateRules,
  validateJobUpdateRules,
} from "../domain/jobRules.ts";
import { resolveCoordinatesFromZip } from "./locationService.ts";

function normalizeUrgency(value: string | null | undefined): string {
  const normalized = String(value ?? JobUrgency.ASAP)
    .trim()
    .toUpperCase();

  if (!Object.values(JobUrgency).includes(normalized as JobUrgency)) {
    throw new Error(`Invalid urgency: ${normalized}`);
  }

  return normalized;
}

export async function postJob(
  prisma: PrismaClient,
  payload: Record<string, any>,
) {
  const nextRuleState = validateJobCreateRules(payload);

  const rawZipCode = payload.zip_code ?? payload.zipCode ?? payload.zipcode;
  const zipCode = rawZipCode == null ? "" : String(rawZipCode).trim();
  const { city, state, latitude, longitude } = await resolveCoordinatesFromZip(
    prisma,
    zipCode,
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
    zip_code: zipCode,
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

  const rawZipCode = payload.zip_code ?? payload.zipCode ?? payload.zipcode;
  const zipCode = rawZipCode == null ? "" : String(rawZipCode).trim();

  if ("title" in payload) data.title = payload.title;
  if ("description" in payload) data.description = payload.description;
  if ("category" in payload) data.category = payload.category;

  if (zipCode !== "") {
    const { latitude, longitude, city, state } =
      await resolveCoordinatesFromZip(prisma, zipCode);
    data.zip_code = zipCode;
    data.city = city;
    data.state = state;
    data.latitude = latitude;
    data.longitude = longitude;
  }

  data.urgency = normalizeUrgency(
    payload.urgency ?? payload.urgency ?? JobUrgency.ASAP,
  );

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
