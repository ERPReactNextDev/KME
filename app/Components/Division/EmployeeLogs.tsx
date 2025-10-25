"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BadgeCheckIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ORIGIN = { lat: 14.60023, lon: 121.05945 };
const WALK_KMH = 5;
const DRIVE_KMH = 30;

interface LogData {
  Latitude?: number | string;
  Longitude?: number | string;
  Location?: string;
  Type?: string;
  Status?: string;
  Email?: string;
  ReferenceID?: string;
  date_created?: string;
}

interface AggLoc {
  lat: number;
  lon: number;
  cnt: number;
  name?: string;
  type?: string;
  status?: string;
  address?: string;
}

interface Card13Props {
  ReferenceID: string;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fmtTime = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
};

const SetMapRef: React.FC<{ setMap: (m: L.Map) => void }> = ({ setMap }) => {
  const m = useMap();
  useEffect(() => void setMap(m), [m]);
  return null;
};

const Card13: React.FC<Card13Props> = ({ ReferenceID }) => {
  const mapRef = useRef<L.Map | null>(null);
  const [posts, setPosts] = useState<LogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lon: number; accuracy: number } | null>(
    null
  );
  const [addressCache, setAddressCache] = useState<Record<string, string>>({});

  // 🧭 Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/fetchlogs`);
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        const filtered = (Array.isArray(data) ? data : data.data || []).filter(
          (log: LogData) => log.ReferenceID === ReferenceID
        );
        setPosts(filtered);
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (ReferenceID) fetchLogs();
  }, [ReferenceID]);

  // 🧩 Combine by location
  const locations = useMemo(() => {
    const map = new Map<string, AggLoc>();
    posts.forEach((p) => {
      if (!p.Latitude || !p.Longitude) return;
      const lat = +p.Latitude,
        lon = +p.Longitude;
      const key = `${lat.toFixed(4)}|${lon.toFixed(4)}`;
      if (map.has(key)) {
        const e = map.get(key)!;
        e.cnt += 1;
      } else {
        map.set(key, {
          lat,
          lon,
          cnt: 1,
          name: p.Location,
          type: p.Type,
          status: p.Status,
        });
      }
    });
    return [...map.values()];
  }, [posts]);

  // 🏙️ Fetch address
  useEffect(() => {
    const fetchAddress = async (lat: number, lon: number) => {
      const key = `${lat},${lon}`;
      if (addressCache[key]) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await res.json();
        const addr = data.display_name || "Unknown location";
        setAddressCache((prev) => ({ ...prev, [key]: addr }));
      } catch {
        setAddressCache((prev) => ({ ...prev, [key]: "Unknown location" }));
      }
    };

    locations.forEach((loc) => {
      const key = `${loc.lat},${loc.lon}`;
      if (!addressCache[key]) fetchAddress(loc.lat, loc.lon);
    });
  }, [locations, addressCache]);

  const center: [number, number] =
    locations.length > 0 ? [locations[0].lat, locations[0].lon] : [ORIGIN.lat, ORIGIN.lon];

  // 👣 Locate user
  const handleLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPos({ lat: latitude, lon: longitude, accuracy });
        mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1.25 });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 📍 Zoom to location when clicked
  const handleZoomTo = (lat: number, lon: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 16, { duration: 1 });
    }
  };

  const locsWithDist = useMemo(() => {
    return locations.map((l) => {
      const dist = haversineKm(ORIGIN.lat, ORIGIN.lon, l.lat, l.lon);
      return {
        ...l,
        dist,
        walkTime: fmtTime(dist / WALK_KMH),
        driveTime: fmtTime(dist / DRIVE_KMH),
        address: addressCache[`${l.lat},${l.lon}`],
      };
    });
  }, [locations, addressCache]);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 border rounded-xl bg-white shadow-sm">
        Loading map data...
      </div>
    );

  if (posts.length === 0)
    return (
      <div className="p-6 text-center text-gray-600 border rounded-xl bg-white shadow-sm">
        No logs found for this ReferenceID.
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6">
      {/* 🧭 Locations List */}
      <div className="flex flex-col gap-4 md:w-1/3 h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-base font-semibold">Visited Locations</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={locating}
          >
            <MapPinIcon className="w-4 h-4 mr-1" />
            {locating ? "Locating..." : "Locate Me"}
          </Button>
        </div>

        {locsWithDist.map((l, i) => (
          <Item
            key={i}
            variant="outline"
            className="hover:bg-accent cursor-pointer transition"
            onClick={() => handleZoomTo(l.lat, l.lon)}
          >
            <ItemMedia>
              <BadgeCheckIcon className="size-5 text-green-600" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{l.name || "Unnamed Place"}</ItemTitle>
              <ItemDescription className="text-xs">
                {l.address || "Fetching address..."}
              </ItemDescription>
              <div className="text-xs text-muted-foreground mt-1">
                {l.dist.toFixed(2)} km • 🚶 {l.walkTime} • 🚗 {l.driveTime}
              </div>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4 text-gray-500" />
            </ItemActions>
          </Item>
        ))}
      </div>

      {/* 🗺️ Map Section */}
      <div className="relative md:w-2/3 h-96 rounded-xl overflow-hidden border shadow-sm">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <SetMapRef setMap={(m) => (mapRef.current = m)} />
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* HQ Marker */}
          <Marker position={[ORIGIN.lat, ORIGIN.lon]}>
            <Popup>
              HQ / Origin
              <br />
              ({ORIGIN.lat}, {ORIGIN.lon})
            </Popup>
          </Marker>

          {/* Visited Locations */}
          {locsWithDist.map((loc, i) => (
            <React.Fragment key={i}>
              <Marker position={[loc.lat, loc.lon]}>
                <Popup>
                  <b>{loc.name || "Unnamed Place"}</b>
                  <br />
                  📍 {loc.address || "Fetching address..."}
                  <br />
                  {loc.type && <div>Type: {loc.type}</div>}
                  {loc.status && <div>Status: {loc.status}</div>}
                  <div>Visits: {loc.cnt}</div>
                  <div>Distance: {loc.dist.toFixed(2)} km</div>
                  <div>Walk: {loc.walkTime} • Drive: {loc.driveTime}</div>
                </Popup>
              </Marker>

              <Polyline
                positions={[
                  [ORIGIN.lat, ORIGIN.lon],
                  [loc.lat, loc.lon],
                ]}
                pathOptions={{ weight: 1, dashArray: "4 4" }}
              >
                <Tooltip sticky direction="center">
                  {loc.dist.toFixed(2)} km • 🚶 {loc.walkTime} • 🚗 {loc.driveTime}
                </Tooltip>
              </Polyline>
            </React.Fragment>
          ))}

          {userPos && (
            <>
              <Marker position={[userPos.lat, userPos.lon]}>
                <Popup>You are here.</Popup>
              </Marker>
              <Circle
                center={[userPos.lat, userPos.lon]}
                radius={userPos.accuracy}
                pathOptions={{ color: "#1d4ed8", fillOpacity: 0.1 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Card13;
