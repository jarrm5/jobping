interface Coordinates {
  latitude: number;
  longitude: number;
  placeName?: string;
  state?: string;
  stateAbbreviation?: string;
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
    placeName: place["place name"],
    state: place.state,
    stateAbbreviation: place["state abbreviation"],
  };
}

/* Sample response

{
    "country": "United States",
    "country abbreviation": "US",
    "post code": "64154",
    "places": [
        {
            "place name": "Kansas City",
            "longitude": "-94.6354",
            "latitude": "39.2547",
            "state": "Missouri",
            "state abbreviation": "MO"
        }
    ]
*/
