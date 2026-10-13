import test from "node:test";
import assert from "node:assert/strict";

import { postJob } from "./jobService.ts";

const makePrisma = (created: any) =>
  ({
    job: {
      create: async ({ data }: { data: any }) => {
        return {
          id: 1,
          ...data,
          created_at: new Date(),
          updated_at: new Date(),
        };
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

test("postJob looks up coordinates from zip_code_locations when lat/long are omitted", async () => {
  const prisma = {
    job: {
      create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
    },
    zipCodeLocation: {
      findUnique: async ({ where }: { where: any }) => ({
        zipCode: where.zipCode,
        latitude: 40.7128,
        longitude: -74.006,
      }),
      create: async ({ data }: { data: any }) => data,
    },
  } as any;

  const result = await postJob(prisma, {
    title: "Fix leaky pipe",
    description: "Repair the sink pipe",
    urgency: "ASAP",
    homeownerId: 7,
    serviceTypeId: 3,
    zipCode: "10001",
    address: "123 Main St",
    city: "Boston",
    state: "MA",
  });

  assert.equal(result.latitude, 40.7128);
  assert.equal(result.longitude, -74.006);
});

test("postJob geocodes missing zip coordinates and saves them to zip_code_locations", async () => {
  const originalFetch = global.fetch;
  const createdZipCodeLocations: any[] = [];

  global.fetch = (async () => ({
    ok: true,
    json: async () => ({
      places: [{ latitude: "39.2547", longitude: "-94.6354" }],
    }),
  })) as any;

  try {
    const prisma = {
      job: {
        create: async ({ data }: { data: any }) => ({ id: 1, ...data }),
      },
      zipCodeLocation: {
        findUnique: async () => null,
        create: async ({ data }: { data: any }) => {
          createdZipCodeLocations.push(data);
          return data;
        },
      },
    } as any;

    const result = await postJob(prisma, {
      title: "Fix leaky pipe",
      description: "Repair the sink pipe",
      urgency: "ASAP",
      homeownerId: 7,
      serviceTypeId: 3,
      zipCode: "64154",
      address: "123 Main St",
      city: "Kansas City",
      state: "MO",
    });

    assert.equal(result.latitude, 39.2547);
    assert.equal(result.longitude, -94.6354);
    assert.deepEqual(createdZipCodeLocations[0], {
      zipCode: "64154",
      latitude: 39.2547,
      longitude: -94.6354,
    });
  } finally {
    global.fetch = originalFetch;
  }
});
