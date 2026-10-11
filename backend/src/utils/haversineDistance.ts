function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusMiles = 3959;

  // Convert degrees to radians
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * centralAngle;
}

// Example
//const distance = haversineDistance(
//  41.2565, -95.9345, // Omaha, Nebraska
//  41.1400, -96.0000  // Example second location
//);

//console.log(`${distance.toFixed(2)} miles`);
