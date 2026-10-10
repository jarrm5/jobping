import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus, JobUrgency } from "../../prisma/generated/prisma/enums.ts";
import {
  validateJobCreateRules,
  validateJobUpdateRules,
} from "../domain/jobRules.ts";

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

  const data: Record<string, any> = {
    title: String(payload.title ?? "").trim(),
    description: payload.description ?? null,
    urgency: normalizeUrgency(payload.urgency ?? payload.urgency ?? JobUrgency.ASAP),
    status: nextRuleState.status ?? JobStatus.OPEN,
    homeowner_id: Number(payload.homeownerId ?? payload.homeowner_id),
    service_type_id: Number(payload.serviceTypeId ?? payload.service_type_id),
    address: payload.address ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    zip_code: payload.zipCode ?? payload.zip_code ?? null,
    latitude:
      payload.latitude === undefined || payload.latitude === null
        ? null
        : Number(payload.latitude),
    longitude:
      payload.longitude === undefined || payload.longitude === null
        ? null
        : Number(payload.longitude),
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

  if ("title" in payload) data.title = payload.title;
  if ("description" in payload) data.description = payload.description;
  if ("category" in payload) data.category = payload.category;
  if ("zipcode" in payload) data.zip_code = payload.zipcode ?? payload.zipCode;
  if ("zipCode" in payload) data.zip_code = payload.zipCode;
  if ("address" in payload) data.address = payload.address;
  if ("city" in payload) data.city = payload.city;
  if ("state" in payload) data.state = payload.state;
  if ("latitude" in payload) data.latitude = Number(payload.latitude);
  if ("longitude" in payload) data.longitude = Number(payload.longitude);
  if ("serviceTypeId" in payload || "service_type_id" in payload) {
    data.service_type_id = Number(
      payload.serviceTypeId ?? payload.service_type_id,
    );
  }
  if ("homeownerId" in payload || "homeowner_id" in payload) {
    data.homeowner_id = Number(payload.homeownerId ?? payload.homeowner_id);
  }

  const nextRuleState = validateJobUpdateRules(currentJob, payload);

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
