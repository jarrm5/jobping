import test from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "../../../prisma/generated/prisma/client.ts";
import { JobStatus } from "../../../prisma/generated/prisma/enums.ts";
import {
  logEligibleProvidersForOpenJobs,
} from "../providerMatchingService.ts";
import { isProviderEligibleForJob } from "../../domain/providerMatching.ts";

test("isProviderEligibleForJob checks the provider service radius", () => {
  const job = { latitude: 40.7128, longitude: -74.006 };
  const nearbyProvider = {
    latitude: 40.7306,
    longitude: -73.9352,
    service_radius: 5,
  };
  const distantProvider = {
    ...nearbyProvider,
    latitude: 41.8781,
    longitude: -87.6298,
  };

  assert.equal(isProviderEligibleForJob(job, nearbyProvider), true);
  assert.equal(isProviderEligibleForJob(job, distantProvider), false);
  assert.equal(
    isProviderEligibleForJob({ latitude: null, longitude: null }, nearbyProvider),
    false,
  );
});

test("logEligibleProvidersForOpenJobs fetches OPEN jobs and logs eligible providers", async () => {
  const providerInRadius = {
    id: 1,
    name: "Nearby Provider",
    latitude: 40.7306,
    longitude: -73.9352,
    service_radius: 5,
  };
  const providerOutOfRadius = {
    id: 2,
    name: "Distant Provider",
    latitude: 41.8781,
    longitude: -87.6298,
    service_radius: 5,
  };
  let query: unknown;
  const prisma = {
    job: {
      findMany: async (args: unknown) => {
        query = args;
        return [
          {
            id: 10,
            title: "Repair a faucet",
            latitude: 40.7128,
            longitude: -74.006,
            service_type: {
              providers: [
                { provider: providerInRadius },
                { provider: providerOutOfRadius },
              ],
            },
          },
        ];
      },
    },
  } as unknown as PrismaClient;
  const logged: unknown[] = [];
  const originalLog = console.log;
  console.log = (...values: unknown[]) => logged.push(...values);

  try {
    await logEligibleProvidersForOpenJobs(prisma);
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(query, {
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
  assert.deepEqual(logged, [
    {
      jobId: 10,
      jobTitle: "Repair a faucet",
      eligibleProviders: [{ id: 1, name: "Nearby Provider" }],
    },
  ]);
});
