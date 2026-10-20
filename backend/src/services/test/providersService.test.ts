import test from "node:test";
import assert from "node:assert/strict";

import { postProvider } from "../providersService.ts";

test("postProvider uses the cached ZIP location instead of submitted location data", async () => {
  let providerData: any;
  const prisma = {
    provider: {
      create: async ({ data }: { data: any }) => {
        providerData = data;
        return data;
      },
    },
    zipCodeLocation: {
      findUnique: async () => ({
        zipCode: "10001",
        city: "New York",
        state: "NY",
        latitude: 40.7506,
        longitude: -73.9972,
      }),
    },
  } as any;

  await postProvider(prisma, {
    name: "Taylor",
    email: "taylor@example.com",
    password: "secret",
    zip_code: "10001",
    city: "Wrong City",
    state: "XX",
    latitude: 1,
    longitude: 2,
  });

  assert.equal(providerData.city, "New York");
  assert.equal(providerData.state, "NY");
  assert.equal(providerData.zip_code, "10001");
  assert.equal(providerData.latitude, 40.7506);
  assert.equal(providerData.longitude, -73.9972);
});

test("postProvider geocodes and stores a ZIP missing from the backend", async () => {
  const originalFetch = global.fetch;
  const createdLocations: any[] = [];
  let providerData: any;

  global.fetch = (async () => ({
    ok: true,
    json: async () => ({
      places: [
        {
          "place name": "Kansas City",
          "state abbreviation": "MO",
          latitude: "39.2547",
          longitude: "-94.6354",
        },
      ],
    }),
  })) as any;

  try {
    const prisma = {
      provider: {
        create: async ({ data }: { data: any }) => {
          providerData = data;
          return data;
        },
      },
      zipCodeLocation: {
        findUnique: async () => null,
        create: async ({ data }: { data: any }) => {
          createdLocations.push(data);
          return data;
        },
      },
    } as any;

    await postProvider(prisma, {
      name: "Taylor",
      email: "taylor@example.com",
      password: "secret",
      zip_code: "64154",
    });

    assert.deepEqual(createdLocations[0], {
      zipCode: "64154",
      latitude: 39.2547,
      longitude: -94.6354,
      city: "Kansas City",
      state: "MO",
    });
    assert.equal(providerData.city, "Kansas City");
    assert.equal(providerData.state, "MO");
    assert.equal(providerData.zip_code, "64154");
    assert.equal(providerData.latitude, 39.2547);
    assert.equal(providerData.longitude, -94.6354);
  } finally {
    global.fetch = originalFetch;
  }
});
