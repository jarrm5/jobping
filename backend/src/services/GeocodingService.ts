interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function getCoordinatesFromZip(
  zipCode: string,
): Promise<Coordinates> {
  const response = await fetch(
    `https://api.zippopotam.us/us/${encodeURIComponent(zipCode)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to find coordinates for ZIP code");
  }

  const data = await response.json();
  const place = data.places?.[0];

  if (!place) {
    throw new Error("No location found for ZIP code");
  }

  return {
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
  };
}
