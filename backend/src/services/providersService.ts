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
  const location = zipCode
    ? await resolveCoordinatesFromZip(prisma, zipCode)
    : null;

  return prisma.provider.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      city: location ? location.city : (payload.city ?? null),
      state: location ? location.state : (payload.state ?? null),
      zip_code: location?.zipCode ?? rawZipCode ?? null,
      latitude: location?.latitude ?? payload.latitude ?? null,
      longitude: location?.longitude ?? payload.longitude ?? null,
      service_radius: payload.service_radius ?? 10,
    },
  });
}
