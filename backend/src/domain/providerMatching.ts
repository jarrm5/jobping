import type { Job, Provider } from "../../prisma/generated/prisma/client.ts";
import { haversineDistance } from "../utils/haversineDistance.ts";

type MatchableJob = Pick<Job, "latitude" | "longitude">;
type MatchableProvider = Pick<
  Provider,
  "latitude" | "longitude" | "service_radius"
>;

export function isProviderEligibleForJob(
  job: MatchableJob,
  provider: MatchableProvider,
): boolean {
  if (
    job.latitude === null ||
    job.longitude === null ||
    provider.latitude === null ||
    provider.longitude === null
  ) {
    return false;
  }

  const distance = haversineDistance(
    job.latitude,
    job.longitude,
    provider.latitude,
    provider.longitude,
  );

  return distance <= provider.service_radius;
}
