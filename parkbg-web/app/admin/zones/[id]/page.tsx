"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useParams, useRouter } from "next/navigation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function EditZonePage() {
  const { id } = useParams();
  const router = useRouter();

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [points, setPoints] = useState<[number, number][]>([]);
  const [zone, setZone] = useState<any>(null);

  // load zone
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/zones/${id}`)
      .then((r) => r.json())
      .then((z) => {
        setZone(z);

        const coords = z.polygonGeoJson.coordinates[0];
        setPoints(coords.slice(0, -1)); // махаме последната (затваряща)
      });
  }, [id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const polygon =
      points.length >= 3
        ? {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[...points, points[0]]],
            },
          }
        : null;

    if (polygon) {
      if (!map.getSource("polygon")) {
        map.addSource("polygon", {
          type: "geojson",
          data: polygon,
        });

        map.addLayer({
          id: "polygon-fill",
          type: "fill",
          source: "polygon",
          paint: {
            "fill-color": "#3b82f6",
            "fill-opacity": 0.2,
          },
        });

        map.addLayer({
          id: "polygon-line",
          type: "line",
          source: "polygon",
          paint: {
            "line-color": "#2563eb",
            "line-width": 3,
          },
        });
      } else {
        (map.getSource("polygon") as any).setData(polygon);
      }
    }
  }, [points]);
  async function save() {
    const polygon = {
      type: "Polygon",
      coordinates: [[...points, points[0]]],
    };

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/zones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        polygonGeoJson: polygon,
      }),
    });

    router.push("/admin/zones-list");
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
      <div style={{ padding: 20 }}>
        <h2>Редакция на зона</h2>

        <button onClick={() => setPoints((p) => p.slice(0, -1))}>
          Махни последна точка
        </button>

        <button onClick={() => setPoints([])}>Изчисти</button>

        <button onClick={save}>Запази</button>
      </div>

      <div ref={containerRef} style={{ height: "100vh" }} />
    </div>
  );
}
