import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { resolveCoordinatesFromZip } from "./locationService.ts";

export function getProviders(prisma: PrismaClient) {
  return prisma.provider.findMany();
}

export function getProvider(prisma: PrismaClient, id: number) {
  return prisma.provider.findUnique({ where: { id } });
}

export async function postProvider(
  prisma: PrismaClient,
  payload: Record<string, any>,
) {
  const rawZipCode = payload.zip_code ?? payload.zipCode ?? payload.zipcode;
  const zipCode = rawZipCode == null ? "" : String(rawZipCode).trim();
  const { city, state, latitude, longitude } = await resolveCoordinatesFromZip(
    prisma,
    zipCode,
  );

  return prisma.provider.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      city,
      state,
      zip_code: zipCode,
      latitude,
      longitude,
      service_radius: payload.service_radius ?? 10,
    },
  });
}
