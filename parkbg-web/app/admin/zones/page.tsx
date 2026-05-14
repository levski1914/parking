"use client";

import { AdminGuard } from "@/app/components/auth/AdminGuard";
import { AdminNavbar } from "@/app/components/layout/admin-navbar";
import mapboxgl from "mapbox-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/app/lib/auth"; // смени пътя ако е друг
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type City = {
  id: string;
  name: string;
  slug: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
};

function getZoneFillColor(zoneType: string) {
  switch (zoneType) {
    case "BLUE":
      return "#3b82f6";
    case "GREEN":
      return "#22c55e";
    case "PINK":
      return "#ec4899";
    default:
      return "#6b7280";
  }
}

export default function AdminZonesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState("");
  const [name, setName] = useState("");
  const token = getToken();
  const [zoneType, setZoneType] = useState("BLUE");
  const [priceText, setPriceText] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsTemplate, setSmsTemplate] = useState("");
  const [points, setPoints] = useState<[number, number][]>([]);
  const [message, setMessage] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pointMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === cityId) || null,
    [cities, cityId],
  );

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setCities);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [27.9147, 43.2141],
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("zone-draw-line", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "zone-draw-line-layer",
        type: "line",
        source: "zone-draw-line",
        paint: {
          "line-color": "#2563eb",
          "line-width": 3,
        },
      });

      map.addSource("zone-draw-fill", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      map.addLayer({
        id: "zone-draw-fill-layer",
        type: "fill",
        source: "zone-draw-fill",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.18,
        },
      });

      map.on("click", (e) => {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        setPoints((prev) => [...prev, [lng, lat]]);
      });
    });

    mapRef.current = map;

    return () => {
      pointMarkersRef.current.forEach((m) => m.remove());
      pointMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCity) return;

    map.flyTo({
      center: [selectedCity.centerLng, selectedCity.centerLat],
      zoom: selectedCity.defaultZoom ?? 13,
      duration: 900,
    });
  }, [selectedCity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    pointMarkersRef.current.forEach((m) => m.remove());
    pointMarkersRef.current = [];

    points.forEach(([lng, lat], index) => {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "999px";
      el.style.background = "#2563eb";
      el.style.border = "2px solid #ffffff";
      el.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.2)";
      el.title = `Точка ${index + 1}`;

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      pointMarkersRef.current.push(marker);
    });

    const lineSource = map.getSource("zone-draw-line") as
      | mapboxgl.GeoJSONSource
      | undefined;
    const fillSource = map.getSource("zone-draw-fill") as
      | mapboxgl.GeoJSONSource
      | undefined;

    const lineGeoJson =
      points.length >= 2
        ? {
            type: "FeatureCollection" as const,
            features: [
              {
                type: "Feature" as const,
                geometry: {
                  type: "LineString" as const,
                  coordinates: points,
                },
                properties: {},
              },
            ],
          }
        : {
            type: "FeatureCollection" as const,
            features: [],
          };

    const canPreviewPolygon = points.length >= 3;
    const closedPoints = canPreviewPolygon ? [...points, points[0]] : [];

    const fillGeoJson = canPreviewPolygon
      ? {
          type: "FeatureCollection" as const,
          features: [
            {
              type: "Feature" as const,
              geometry: {
                type: "Polygon" as const,
                coordinates: [closedPoints],
              },
              properties: {},
            },
          ],
        }
      : {
          type: "FeatureCollection" as const,
          features: [],
        };

    if (lineSource) {
      lineSource.setData(lineGeoJson);
    }

    if (fillSource) {
      fillSource.setData(fillGeoJson);
    }

    if (map.getLayer("zone-draw-fill-layer")) {
      map.setPaintProperty(
        "zone-draw-fill-layer",
        "fill-color",
        getZoneFillColor(zoneType),
      );
    }

    if (map.getLayer("zone-draw-line-layer")) {
      map.setPaintProperty(
        "zone-draw-line-layer",
        "line-color",
        getZoneFillColor(zoneType),
      );
    }
  }, [points, zoneType]);

  async function saveZone() {
    setMessage("");

    if (!cityId) {
      setMessage("Избери град.");
      return;
    }

    if (!name.trim()) {
      setMessage("Въведи име на зоната.");
      return;
    }

    if (!priceText.trim()) {
      setMessage("Въведи цена.");
      return;
    }

    if (points.length < 3) {
      setMessage("Добави поне 3 точки на картата.");
      return;
    }

    const polygonGeoJson = {
      type: "Polygon",
      coordinates: [[...points, points[0]]],
    };

    const token = getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/zones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cityId,
        name,
        zoneType,
        priceText,
        smsNumber,
        smsTemplate,
        polygonGeoJson,
      }),
    });
    if (!res.ok) {
      setMessage("Възникна проблем при записването на зоната.");
      return;
    }

    setMessage("Зоната беше записана успешно.");
    setName("");
    setPriceText("");
    setSmsNumber("");
    setSmsTemplate("");
    setPoints([]);
  }

  function clearPoints() {
    setPoints([]);
    setMessage("");
  }

  function undoLastPoint() {
    setPoints((prev) => prev.slice(0, -1));
  }

  return (
    <AdminGuard allowMunicipality>
      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "380px 1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h1 style={{ marginTop: 0 }}>Добави зона</h1>
            <p style={{ color: "#64748b", lineHeight: 1.5 }}>
              Избери град, попълни данните и цъкай по картата, за да очертаеш
              зоната.
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="">Избери град</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Име на зоната"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <select
                value={zoneType}
                onChange={(e) => setZoneType(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="BLUE">Синя зона</option>
                <option value="GREEN">Зелена зона</option>
                <option value="PINK">Розова зона</option>
                <option value="OTHER">Друга зона</option>
              </select>

              <input
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="Цена (пример: 2.00 лв/час)"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                value={smsNumber}
                onChange={(e) => setSmsNumber(e.target.value)}
                placeholder="SMS номер"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                value={smsTemplate}
                onChange={(e) => setSmsTemplate(e.target.value)}
                placeholder="Примерен SMS"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {points.length === 0
                  ? "Започни да очертаваш зоната, като цъкаш по картата."
                  : `Добавени точки: ${points.length}. При 3 или повече точки ще виждаш preview.`}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={undoLastPoint}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Премахни последната точка
                </button>

                <button
                  type="button"
                  onClick={clearPoints}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Изчисти
                </button>
              </div>

              <button
                type="button"
                onClick={saveZone}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #2563eb",
                  background: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Запази зона
              </button>

              {message && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 12, color: "#64748b", fontSize: 14 }}>
              Цъкай на картата, за да добавяш точки. Preview-то се запълва
              автоматично.
            </div>

            <div
              ref={containerRef}
              style={{ height: 760, borderRadius: 12, overflow: "hidden" }}
            />
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
