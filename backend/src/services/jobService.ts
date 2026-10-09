import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { validateJobUpdateRules } from "../domain/jobRules.ts";

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
