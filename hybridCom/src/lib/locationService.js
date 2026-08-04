// Fallback default coordinates (Surat / Gujarat area as baseline)
export const DEFAULT_COORDINATES = {
  lat: 21.519,
  lng: 70.456,
};

/**
 * Fetch IP-based location via reliable public IP geolocation services
 */
export async function getIPLocation() {
  // Try ipapi.co first
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
          city: data.city || "IP Location",
          source: "ip",
        };
      }
    }
  } catch (err) {
    console.warn("ipapi.co unavailable, trying fallback IP service", err);
  }

  // Try ip-api.com as fallback
  try {
    const res = await fetch("https://ip-api.com/json/", { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lon) {
        return {
          lat: Number(data.lat),
          lng: Number(data.lon),
          city: data.city || "IP Location",
          source: "ip",
        };
      }
    }
  } catch (err) {
    console.warn("ip-api.com unavailable", err);
  }

  // Final fallback to default coordinates
  return {
    ...DEFAULT_COORDINATES,
    city: "Default Location",
    source: "ip",
  };
}

/**
 * Promise wrapper around navigator.geolocation.getCurrentPosition
 */
export function getGPSLocation(options = { timeout: 8000 }) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by this browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.longitude),
          source: "gps",
        });
      },
      (error) => {
        reject(error);
      },
      options
    );
  });
}

/**
 * Check if user object has a valid saved location from MongoDB storage
 */
export function getSavedUserLocation(user) {
  if (!user) return null;

  let loc = user.location;

  // 1. String format: parse JSON if needed
  if (typeof loc === "string") {
    try {
      loc = JSON.parse(loc);
    } catch {
      // Ignore
    }
  }

  // 2. GeoJSON format: { type: "Point", coordinates: [lng, lat] }
  if (loc?.coordinates && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    const [lng, lat] = loc.coordinates;
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return {
        lat: Number(lat),
        lng: Number(lng),
        address: typeof user.address === "string" ? user.address : "Saved Location",
        source: "saved",
      };
    }
  }

  // 3. Object format: { lat, lng }
  if (loc && typeof loc === "object" && loc.lat != null && loc.lng != null) {
    const lat = Number(loc.lat);
    const lng = Number(loc.lng);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return {
        lat,
        lng,
        address: typeof user.address === "string" ? user.address : "Saved Location",
        source: "saved",
      };
    }
  }

  return null;
}
