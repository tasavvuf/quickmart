import axios from "axios";

/**
 * Calculates straight line Haversine distance in km
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Fetches actual road route, road distance (km), and road ETA (minutes) using OSRM Routing Engine
 * @param {Array} origin - [lat, lng]
 * @param {Array} destination - [lat, lng]
 */
export async function fetchRoadRoute(origin, destination) {
  if (!origin || !destination || origin[0] === 0 || destination[0] === 0) {
    return null;
  }

  const [lat1, lng1] = origin;
  const [lat2, lng2] = destination;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 4000 });

    if (response.data?.code === "Ok" && response.data.routes?.length > 0) {
      const route = response.data.routes[0];
      const distanceKm = Number((route.distance / 1000).toFixed(1)); // Convert meters to km
      const durationMin = Math.max(1, Math.round(route.duration / 60)); // Convert seconds to minutes

      // OSRM returns coordinates as [lng, lat]. Convert to Leaflet [lat, lng]
      const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      return {
        distanceKm,
        durationMin,
        coordinates,
        source: "OSRM Road Engine",
      };
    }
  } catch (err) {
    console.warn("OSRM routing request fallback to straight-line:", err?.message);
  }

  // Fallback to straight-line path if OSRM service is unavailable
  const haversineKm = calculateHaversineDistance(lat1, lng1, lat2, lng2);
  const fallbackEta = Math.max(3, Math.round((haversineKm / 25) * 60)); // Approx 25km/h city speed

  return {
    distanceKm: haversineKm,
    durationMin: fallbackEta,
    coordinates: [
      [lat1, lng1],
      [lat2, lng2],
    ],
    source: "Direct Line Fallback",
  };
}
