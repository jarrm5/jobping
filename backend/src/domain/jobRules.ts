import { JobStatus } from "../../prisma/generated/prisma/enums.ts";

type JobState = {
  status?: string | null;
  provider_id?: number | null;
  providerId?: number | null;
};

function normalizeStatus(status: string | null | undefined): string | null {
  if (status === undefined || status === null) {
    return null;
  }

  return String(status).trim().toUpperCase();
}

export function validateJobUpdateRules(
  currentJob: JobState,
  updates: Record<string, any>,
): Record<string, any> {
  const nextStatus = normalizeStatus(
    updates.status ?? currentJob.status ?? null,
  );
  const currentProviderId =
    currentJob.provider_id ?? currentJob.providerId ?? null;
  const rawProviderId =
    updates.provider_id ?? updates.providerId ?? currentProviderId ?? null;
  const nextProviderId =
    rawProviderId === null || rawProviderId === undefined
      ? null
      : Number(rawProviderId);

  if (nextStatus && !Object.values(JobStatus).map((value) => value.toUpperCase()).includes(nextStatus)) {
    throw new Error(`Invalid status: ${nextStatus}`);
  }

  if (nextStatus === JobStatus.OPEN.toUpperCase()) {
    return {
      ...updates,
      status: nextStatus,
      provider_id: null,
    };
  }

  if (
    nextStatus === JobStatus.CLAIMED.toUpperCase() ||
    nextStatus === JobStatus.COMPLETED.toUpperCase()
  ) {
    if (nextProviderId === null || Number.isNaN(nextProviderId)) {
      throw new Error("CLAIMED and COMPLETED jobs require a providerId");
    }
  }

  return {
    ...updates,
    status: nextStatus,
    provider_id: nextProviderId,
  };
}
