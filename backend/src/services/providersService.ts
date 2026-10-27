import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { resolveCoordinatesFromZip } from "./locationService.ts";

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

export async function updateProvider(
  prisma: PrismaClient,
  providerId: number,
  payload: Record<string, any>,
) {
  const currentProvider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!currentProvider) {
    throw new Error("Provider not found");
  }

  const data: Record<string, any> = {};

  const rawZipCode = payload.zip_code ?? payload.zipCode ?? payload.zipcode;
  const zipCode = rawZipCode == null ? "" : String(rawZipCode).trim();

  if ("name" in payload) data.name = payload.name;
  if ("email" in payload) data.email = payload.email;
  if ("password" in payload) data.password = payload.password;
  if ("service_radius" in payload)
    data.service_radius = Number(payload.service_radius);

  if (zipCode !== "") {
    const { latitude, longitude, city, state } =
      await resolveCoordinatesFromZip(prisma, zipCode);
    data.zip_code = zipCode;
    data.city = city;
    data.state = state;
    data.latitude = latitude;
    data.longitude = longitude;
  }
  if (Object.keys(data).length === 0) {
    throw new Error("No valid fields to update");
  }

  data.updated_at = new Date();

  return prisma.provider.update({
    where: { id: providerId },
    data,
  });
}
