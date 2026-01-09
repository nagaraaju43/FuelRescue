import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import {
  Fuel,
  Locate,
  RefreshCcw,
  Loader2,
  Clock,
  Droplets,
  Navigation as NavIcon,
  AlertCircle,
  ChevronLeft,
  X,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";

// --- Assets & Styles ---
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// --- Manual Backup Stations ---
const LOCAL_STATIONS = [
  {
    id: "m1",
    name: "Sri Krishna Fuel Station",
    brand: "Bharat Petroleum",
    lat: 17.535,
    lon: 78.445,
    is247: true,
    hasDiesel: true,
  },
  {
    id: "m2",
    name: "Expressway Highway Bunk",
    brand: "Shell",
    lat: 17.52,
    lon: 78.43,
    is247: false,
    hasDiesel: true,
  },
];

// --- Custom Icon Generators ---
const userIcon = L.divIcon({
  className: "user-marker",
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 bg-blue-500/30 animate-ping rounded-full"></div>
          <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getPumpIcon = (isSelected) =>
  L.divIcon({
    className: "pump-marker",
    html: `<div style="background-color: ${
      isSelected ? "#22c55e" : "#0a0f18"
    }; padding: 8px; border-radius: 50%; border: 2px solid ${
      isSelected ? "white" : "#22c55e"
    }; box-shadow: ${
      isSelected
        ? "0 0 20px rgba(34, 197, 94, 0.8)"
        : "0 0 10px rgba(0,0,0,0.5)"
    }; transition: all 0.3s ease; transform: scale(${
      isSelected ? "1.2" : "1"
    }); display: flex; justify-content: center; align-items: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${
              isSelected ? "black" : "#22c55e"
            }" stroke-width="3"><path d="M3 22L15 22M4 9L14 9M14 22V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v18M18 22V15c0-1.1.9-2 2-2s2 .9 2 2v7M18 15L22 15"/></svg>
         </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

// --- Routing Component ---
function RoutingEngine({ start, end, setRouteInfo }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;
    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    try {
      routingRef.current = L.Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        serviceUrl: "https://router.project-osrm.org/route/v1",
        lineOptions: {
          styles: [{ color: "#22c55e", weight: 6, opacity: 0.8 }],
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null,
      })
        .on("routesfound", (e) => {
          const routes = e.routes;
          setRouteInfo({
            distance: (routes[0].summary.totalDistance / 1000).toFixed(1),
            time: Math.round(routes[0].summary.totalTime / 60),
          });
        })
        .addTo(map);
    } catch (err) {
      console.error("Routing failed", err);
    }

    return () => {
      if (routingRef.current && map) map.removeControl(routingRef.current);
    };
  }, [map, start, end]);
  return null;
}

export default function NearbyPumps() {
  // State Management
  const [userPos, setUserPos] = useState(null);
  const [pumps, setPumps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [targetPump, setTargetPump] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Animation States
  const [isDelivering, setIsDelivering] = useState(false);
  const [truckPos, setTruckPos] = useState(null);
  const [deliveryProgress, setDeliveryProgress] = useState(0);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  };

  const fetchPumps = useCallback(async (lat, lon, type) => {
    setLoading(true);
    setError(null);
    const MIRRORS = [
      "https://overpass-api.de/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
    ];
    let tag = '["amenity"="fuel"]';
    const query = `[out:json][timeout:10];node${tag}(around:10000,${lat},${lon});out;`;

    let success = false;
    let apiPumps = [];

    for (const url of MIRRORS) {
      if (success) break;
      try {
        const res = await fetch(`${url}?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data?.elements) {
          apiPumps = data.elements.map((p) => ({
            id: p.id.toString(),
            name: p.tags.name || "Station",
            lat: p.lat,
            lon: p.lon,
            is247: p.tags.opening_hours?.includes("24/7"),
            hasDiesel: p.tags["fuel:diesel"] !== "no",
            dist: getDistance(lat, lon, p.lat, p.lon),
          }));
          success = true;
        }
      } catch (e) {
        console.warn("Mirror busy...");
      }
    }

    const nearbyLocal = LOCAL_STATIONS.map((p) => ({
      ...p,
      dist: getDistance(lat, lon, p.lat, p.lon),
    })).filter(
      (p) =>
        parseFloat(p.dist) <= 10 &&
        (type === "diesel" ? p.hasDiesel : true) &&
        (type === "24/7" ? p.is247 : true)
    );

    const combined = [...nearbyLocal, ...apiPumps];
    const unique = Array.from(
      new Map(combined.map((p) => [p.name + p.lat, p])).values()
    );

    if (unique.length === 0 && !success)
      setError("Live servers busy. Showing local rescue points.");
    setPumps(unique.sort((a, b) => a.dist - b.dist));
    setLoading(false);
  }, []);

  const startRadar = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        fetchPumps(coords[0], coords[1], filter);
      },
      () => {
        setError("Location Denied");
        setLoading(false);
      }
    );
  };

  const startDelivery = () => {
    setIsModalOpen(false);
    setIsDelivering(true);
    setDeliveryProgress(0);
  };

  useEffect(() => {
    if (isDelivering && targetPump && userPos) {
      const interval = setInterval(() => {
        setDeliveryProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDelivering(false);
            alert("Rescue Completed!");
            return 100;
          }
          const next = prev + 0.5;
          const lat =
            targetPump.lat + (userPos[0] - targetPump.lat) * (next / 100);
          const lon =
            targetPump.lon + (userPos[1] - targetPump.lon) * (next / 100);
          setTruckPos([lat, lon]);
          return next;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isDelivering, targetPump, userPos]);

  return (
    <div className="relative h-screen w-screen bg-[#05080d] overflow-hidden flex flex-col">
      {/* NAVBAR */}
      <nav className="z-[1001] h-16 bg-[#0a0f18]/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4 text-white">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/5 rounded-full"
          >
            <ChevronLeft />
          </button>
          <h1 className="font-bold italic flex items-center gap-2">
            <Fuel className="text-green-500" /> FUEL RADAR
          </h1>
        </div>
        {routeInfo && (
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full text-[10px] text-green-400 font-black">
            {routeInfo.distance} KM • {routeInfo.time} MINS
          </div>
        )}
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* MAP */}
        <div className="absolute inset-0 lg:relative lg:flex-1 z-0">
          <MapContainer
            center={[17.385, 78.486]}
            zoom={13}
            zoomControl={false}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon} />
                <Circle
                  center={userPos}
                  radius={5000}
                  pathOptions={{
                    color: "#22c55e",
                    weight: 1,
                    fillOpacity: 0.05,
                  }}
                />
                {pumps.map((p) => (
                  <Marker
                    key={p.id}
                    position={[p.lat, p.lon]}
                    icon={getPumpIcon(targetPump?.id === p.id)}
                    eventHandlers={{ click: () => setTargetPump(p) }}
                  >
                    <Popup>
                      <div className="text-black font-bold">{p.name}</div>
                    </Popup>
                  </Marker>
                ))}
                {targetPump && (
                  <RoutingEngine
                    start={userPos}
                    end={[targetPump.lat, targetPump.lon]}
                    setRouteInfo={setRouteInfo}
                  />
                )}
                {isDelivering && truckPos && (
                  <Marker
                    position={truckPos}
                    icon={L.divIcon({
                      className: "truck",
                      html: `<div class="bg-amber-500 p-2 rounded-lg shadow-lg border-2 border-white animate-bounce"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3"><path d="M10 17h4V5H2v12h3m0 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0m10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0m4-7h3l3 3v4h-3m-9-9h9v9h-9z"/></svg></div>`,
                    })}
                  />
                )}
              </>
            )}
          </MapContainer>
          <button
            onClick={startRadar}
            className="absolute top-4 right-4 z-[1000] bg-black/80 p-3 rounded-2xl text-white border border-white/20"
          >
            <Locate size={20} />
          </button>
        </div>

        {/* SIDEBAR */}
        <motion.aside
          initial={window.innerWidth < 1024 ? { y: "80%" } : { x: 0 }}
          animate={window.innerWidth < 1024 ? { y: "0%" } : { x: 0 }}
          drag={window.innerWidth < 1024 ? "y" : false}
          className="z-20 w-full lg:w-[420px] absolute bottom-0 lg:relative h-[80vh] lg:h-full flex flex-col bg-[#0a0f18]/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-r border-white/10 rounded-t-[3rem] lg:rounded-none"
        >
          <div className="w-12 h-1 bg-white/10 mx-auto my-4 lg:hidden rounded-full" />

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {isDelivering ? (
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <Fuel className="text-green-500" size={32} />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">
                  Rescue in Progress
                </h2>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
                <button className="flex items-center gap-2 mx-auto text-green-400 font-bold border border-green-500/20 px-6 py-2 rounded-full hover:bg-green-500/10">
                  <Phone size={16} /> CALL DRIVER
                </button>
              </div>
            ) : (
              <>
                {!userPos ? (
                  <button
                    onClick={startRadar}
                    className="w-full bg-green-500 text-black font-black py-4 rounded-2xl"
                  >
                    INITIALIZE SCAN
                  </button>
                ) : (
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                    {["all", "diesel", "24/7"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg ${
                          filter === t
                            ? "bg-green-500 text-black"
                            : "text-slate-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {pumps.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setTargetPump(p)}
                    className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer ${
                      targetPump?.id === p.id
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3
                        className={`font-bold text-sm ${
                          targetPump?.id === p.id
                            ? "text-green-400"
                            : "text-white"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <div className="text-green-400 font-black text-[10px]">
                        {p.dist} KM
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetPump(p);
                        setIsModalOpen(true);
                      }}
                      className="w-full bg-green-500 text-black font-black py-3 rounded-2xl text-[10px] uppercase shadow-lg shadow-green-500/10 active:scale-95"
                    >
                      Request Rescue
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </motion.aside>
      </div>

      {/* REQUEST MODAL */}
      <AnimatePresence>
        {isModalOpen && targetPump && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#0a0f18] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tighter italic">
                Confirm Rescue
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Selected Station
                  </p>
                  <p className="text-white font-bold">{targetPump.name}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["5L", "10L", "20L"].map((l) => (
                    <button
                      key={l}
                      className="py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-green-500 hover:text-black font-bold transition-all text-xs"
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={startDelivery}
                  className="w-full bg-green-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-green-500/20 active:scale-95"
                >
                  CONFIRM & BROADCAST
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
