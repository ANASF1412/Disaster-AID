import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLayout from "../layouts/AppLayout.jsx";
import { centersAPI, analyticsAPI } from "../services/api.js";
import Badge from "../components/ui/Badge.jsx";
import toast from "react-hot-toast";

// Fix Leaflet default icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const criticalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapView = () => {
  const [centers, setCenters] = useState([]);
  const [criticalIds, setCriticalIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      centersAPI.getAll({ limit: 100 }),
      analyticsAPI.getCriticalZones(),
    ]).then(([cRes, aRes]) => {
      setCenters(cRes.data.data.centers);
      const ids = new Set(aRes.data.data.criticalCenters.map((c) => c._id));
      setCriticalIds(ids);
    }).catch(() => toast.error("Failed to load map data"))
      .finally(() => setLoading(false));
  }, []);

  const validCenters = centers.filter((c) => c.location?.lat && c.location?.lng);

  return (
    <AppLayout title="Map View">
      <div className="card overflow-hidden" style={{ height: "calc(100vh - 10rem)" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center bg-surface-100 dark:bg-surface-800">
            <p className="text-surface-400 animate-pulse">Loading map...</p>
          </div>
        ) : (
          <MapContainer
            center={validCenters.length > 0 ? [validCenters[0].location.lat, validCenters[0].location.lng] : [20, 0]}
            zoom={validCenters.length > 0 ? 6 : 2}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validCenters.map((center) => {
              const isCritical = criticalIds.has(center._id);
              const pct = center.capacity > 0 ? (center.currentLoad / center.capacity) * 100 : 0;
              return (
                <React.Fragment key={center._id}>
                  <Marker
                    position={[center.location.lat, center.location.lng]}
                    icon={isCritical ? criticalIcon : new L.Icon.Default()}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-semibold text-surface-900 mb-1">{center.name}</p>
                        <p className="text-xs text-surface-500 mb-2">
                          {center.location.lat.toFixed(4)}, {center.location.lng.toFixed(4)}
                        </p>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Load: {center.currentLoad}/{center.capacity}</span>
                          <span className={isCritical ? "text-red-600 font-bold" : "text-green-600"}>{Math.round(pct)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2">
                          <div className={`h-1.5 rounded-full ${isCritical ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        {center.contactInfo && <p className="text-xs text-surface-500">{center.contactInfo}</p>}
                      </div>
                    </Popup>
                  </Marker>
                  {isCritical && (
                    <Circle
                      center={[center.location.lat, center.location.lng]}
                      radius={15000}
                      pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.1, weight: 1 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 px-1">
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-slate-400">
          <div className="w-3 h-3 rounded-full bg-blue-500" /> Normal Center
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-slate-400">
          <div className="w-3 h-3 rounded-full bg-red-500" /> Critical / Overloaded
        </div>
        <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-slate-400">
          <div className="w-3 h-3 rounded-full bg-red-200 border border-red-400" /> Critical Zone Radius
        </div>
      </div>
    </AppLayout>
  );
};

export default MapView;
