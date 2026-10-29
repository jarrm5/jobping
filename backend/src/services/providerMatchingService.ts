import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus } from "../../prisma/generated/prisma/enums.ts";
import { isProviderEligibleForJob } from "../domain/providerMatching.ts";

export async function logEligibleProvidersForOpenJobs(
  prisma: PrismaClient,
): Promise<void> {
  const openJobs = await prisma.job.findMany({
    where: { status: JobStatus.OPEN },
    include: {
      service_type: {
        include: {
          providers: {
            include: { provider: true },
          },
        },
      },
    },
  });

  for (const job of openJobs) {
    const eligibleProviders = job.service_type.providers
      .map(({ provider }) => provider)
      .filter((provider) => isProviderEligibleForJob(job, provider))
      .map(({ id, name }) => ({ id, name }));

    console.log({
      jobId: job.id,
      jobTitle: job.title,
      eligibleProviders,
    });
  }
}
