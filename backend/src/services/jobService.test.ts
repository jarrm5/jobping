import test from "node:test";
import assert from "node:assert/strict";

import { postJob } from "./jobService.ts";

const makePrisma = (created: any) =>
  ({
    job: {
      create: async ({ data }: { data: any }) => {
        return { id: 1, ...data, created_at: new Date(), updated_at: new Date() };
      },
    },
  }) as any;

test("postJob forces an open job to have a null provider_id", async () => {
  const prisma = makePrisma({});

  const result = await postJob(prisma, {
    title: "Fix leaky pipe",
    description: "Repair the sink pipe",
    urgency: "ASAP",
    status: "open",
    homeownerId: 7,
    serviceTypeId: 3,
    providerId: 99,
    zipCode: "10001",
    address: "123 Main St",
    city: "Boston",
    state: "MA",
    latitude: 42.3601,
    longitude: -71.0589,
  });

  assert.equal(result.provider_id, null);
  assert.equal(result.status, "OPEN");
});

test("postJob rejects a claimed job without a provider_id", async () => {
  const prisma = makePrisma({});

  await assert.rejects(
    () =>
      postJob(prisma, {
        title: "Fix leaky pipe",
        description: "Repair the sink pipe",
        urgency: "ASAP",
        status: "claimed",
        homeownerId: 7,
        serviceTypeId: 3,
        providerId: null,
        zipCode: "10001",
        address: "123 Main St",
        city: "Boston",
        state: "MA",
        latitude: 42.3601,
        longitude: -71.0589,
      }),
    /CLAIMED and COMPLETED jobs require a providerId/i,
  );
});
