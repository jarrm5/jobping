import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { getCoordinatesFromZip } from "./GeocodingService.ts";

export async function resolveCoordinatesFromZip(
  prisma: PrismaClient,
  zipCode: string,
) {
  const zipLocation = await prisma.zipCodeLocation?.findUnique?.({
    where: { zipCode },
  });

  if (zipLocation) {
    return {
      zipCode: zipLocation.zipCode,
      latitude: Number(zipLocation.latitude),
      longitude: Number(zipLocation.longitude),
      city: zipLocation.city ?? null,
      state: zipLocation.state ?? null,
    };
  }

  const geoCoordinates = await getCoordinatesFromZip(zipCode);

  await prisma.zipCodeLocation?.create?.({
    data: {
      zipCode,
      latitude: geoCoordinates.latitude,
      longitude: geoCoordinates.longitude,
      city: geoCoordinates.city ?? null,
      state: geoCoordinates.state ?? null,
    },
  });

  return {
    zipCode,
    latitude: Number(geoCoordinates.latitude),
    longitude: Number(geoCoordinates.longitude),
    city: geoCoordinates.city ?? null,
    state: geoCoordinates.state ?? null,
  };
}
