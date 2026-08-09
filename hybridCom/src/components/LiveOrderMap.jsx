import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { fetchRoadRoute } from "../lib/routingService";

// Fix default Leaflet icon assets
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icons
const storeIcon = L.divIcon({
  className: "custom-store-pin",
  html: `<div style="background-color:#f59e0b; color:black; width:36px; height:36px; rounded-radius:50%; border-radius:12px; display:flex; align-items:center; justify-center; font-size:18px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); justify-content:center;">🏬</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const customerIcon = L.divIcon({
  className: "custom-customer-pin",
  html: `<div style="background-color:#3b82f6; color:white; width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-center; font-size:18px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); justify-content:center;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const partnerIcon = L.divIcon({
  className: "custom-partner-pin",
  html: `<div style="background-color:#10b981; color:white; width:40px; height:40px; border-radius:14px; display:flex; align-items:center; justify-center; font-size:20px; border:2px solid white; box-shadow:0 6px 14px rgba(0,0,0,0.4); justify-content:center;">🛵</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

/**
 * Auto-Fit Camera Component
 * Keeps map bounds centered around active path while allowing manual adjustment
 */
function MapController({ coordinates = [], resetKey = 0 }) {
  const map = useMap();

  useEffect(() => {
    const validCoords = coordinates.filter(
      (c) => c && c[0] !== 0 && c[1] !== 0 && !isNaN(c[0]) && !isNaN(c[1])
    );

    if (validCoords.length === 1) {
      map.setView(validCoords[0], 15, { animate: true });
    } else if (validCoords.length > 1) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17, animate: true });
    }
  }, [coordinates, map, resetKey]);

  return null;
}

export default function LiveOrderMap({
  storeCoords = [22.286, 70.792],
  customerCoords = [22.2904, 70.7915],
  partnerCoords = null,
  storeName = "Store",
  customerName = "Customer",
  partnerName = "Delivery Partner",
  onRouteCalculated = null,
  height = "340px",
}) {
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  // Validate coordinates
  const validStore = useMemo(
    () => (storeCoords && storeCoords[0] !== 0 ? storeCoords : [22.286, 70.792]),
    [storeCoords]
  );
  const validCustomer = useMemo(
    () => (customerCoords && customerCoords[0] !== 0 ? customerCoords : [22.2904, 70.7915]),
    [customerCoords]
  );
  const validPartner = useMemo(
    () => (partnerCoords && partnerCoords[0] !== 0 && partnerCoords[1] !== 0 ? partnerCoords : null),
    [partnerCoords]
  );

  // Active points array for driving route camera focus
  const activePathCoords = useMemo(() => {
    if (validPartner) {
      return [validPartner, validCustomer];
    }
    return [validStore, validCustomer];
  }, [validStore, validCustomer, validPartner]);

  // Fetch Road Route Geometry
  useEffect(() => {
    async function updateRoute() {
      // If delivery partner is active, calculate partner -> customer route
      // Otherwise, calculate store -> customer route
      const origin = validPartner || validStore;
      const destination = validCustomer;

      const res = await fetchRoadRoute(origin, destination);
      if (res && res.coordinates) {
        setRoadPolyline(res.coordinates);
        setRouteData(res);
        if (onRouteCalculated) {
          onRouteCalculated(res);
        }
      }
    }
    updateRoute();
  }, [validStore, validCustomer, validPartner]);

  const mapCenter = validPartner || validStore || validCustomer;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-lg z-0">
      {/* Route Info Badge Overlay */}
      {routeData && (
        <div className="absolute top-3 left-3 z-[1000] bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-xl shadow-md text-xs space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-500">{routeData.durationMin} min ETA</span>
            <span className="text-muted-foreground">• {routeData.distanceKm} km</span>
          </div>
          <span className="text-[10px] text-muted-foreground block">{routeData.source}</span>
        </div>
      )}

      {/* Re-center / Focus Path Button */}
      <button
        type="button"
        onClick={() => setResetKey((k) => k + 1)}
        className="absolute bottom-3 right-3 z-[1000] bg-background/90 backdrop-blur-md border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-xl shadow-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        title="Recenter camera on driving path"
      >
        <span className="text-amber-400">📍</span>
        <span>Focus Path</span>
      </button>

      <MapContainer
        center={mapCenter}
        zoom={15}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        style={{ height, width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Camera Controller */}
        <MapController coordinates={activePathCoords} resetKey={resetKey} />

        {/* Store Pin */}
        <Marker position={validStore} icon={storeIcon}>
          <Popup>
            <div className="text-xs font-bold">
              🏬 {storeName} <span className="block text-muted-foreground">Pickup Location</span>
            </div>
          </Popup>
        </Marker>

        {/* Customer Pin */}
        <Marker position={validCustomer} icon={customerIcon}>
          <Popup>
            <div className="text-xs font-bold">
              📍 {customerName} <span className="block text-muted-foreground">Delivery Destination</span>
            </div>
          </Popup>
        </Marker>

        {/* Delivery Partner Pin (If Assigned & Active) */}
        {validPartner && (
          <Marker position={validPartner} icon={partnerIcon}>
            <Popup>
              <div className="text-xs font-bold">
                🛵 {partnerName} <span className="block text-emerald-500">Live GPS Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Road Route Geometry Polyline */}
        {roadPolyline.length > 0 && (
          <Polyline
            positions={roadPolyline}
            color="#f59e0b"
            weight={5}
            opacity={0.85}
            dashArray={validPartner ? "none" : "8, 8"}
          />
        )}
      </MapContainer>
    </div>
  );
}
