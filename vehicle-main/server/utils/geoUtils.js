// Haversine distance between two points in km
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Generate waypoints between two points (scaled for intra-city routes)
const generateWaypoints = (start, end, numPoints = 10) => {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start.lat + (end.lat - start.lat) * t + (Math.random() - 0.5) * 0.005;
    const lng = start.lng + (end.lng - start.lng) * t + (Math.random() - 0.5) * 0.005;
    points.push([lat, lng]);
  }
  return points;
};

// Estimate duration based on distance (avg 25 km/h for city cleaning vehicles)
const estimateDuration = (distanceKm) => Math.round(distanceKm / 25 * 60);

// Check if a point is within Kurnool city bounds
const isWithinKurnool = (lat, lng) => {
  return lat >= 15.78 && lat <= 15.86 && lng >= 77.99 && lng <= 78.09;
};

module.exports = { haversineDistance, generateWaypoints, estimateDuration, isWithinKurnool };
