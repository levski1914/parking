"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Navbar } from "@/app/components/layout/navbar";
import { useRef } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

type City = {
  id: string;
  name: string;
  slug: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
};

async function reverseGeocode(lat: number, lng: number) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?language=bg&access_token=${token}`,
  );

  if (!res.ok) {
    throw new Error("Failed to reverse geocode");
  }

  const data = await res.json();

  return data?.features?.[0]?.place_name || "";
}
function AddParkingMap({
  city,
  latitude,
  longitude,
  onPickLocation,
}: {
  city: City | null;
  latitude: string;
  longitude: string;
  onPickLocation: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  function createPinElement() {
    const el = document.createElement("div");

    el.style.width = "18px";
    el.style.height = "18px";
    el.style.borderRadius = "50%";
    el.style.background = "#2563eb";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 0 4px rgba(37, 99, 235, 0.25)";
    el.style.cursor = "pointer";

    return el;
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: city ? [city.centerLng, city.centerLat] : [27.9147, 43.2141],
      zoom: city?.defaultZoom ?? 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      onPickLocation(lat, lng);

      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({
          element: createPinElement(),
          anchor: "center",
        })
          .setLngLat([lng, lat])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      map.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 800,
      });
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !city) return;

    map.flyTo({
      center: [city.centerLng, city.centerLat],
      zoom: city.defaultZoom ?? 13,
      duration: 800,
    });
  }, [city]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !latitude || !longitude) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({
        element: createPinElement(),
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [latitude, longitude]);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ marginBottom: 12, color: "#64748b", fontSize: 14 }}>
        {latitude && longitude
          ? "Локацията е избрана. Цъкни отново, за да преместиш pin-а."
          : "Цъкни на картата, за да избереш локация"}
      </div>

      <div
        ref={containerRef}
        style={{ height: 700, borderRadius: 12, overflow: "hidden" }}
      />

      {latitude && longitude && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#16a34a" }}>
          ✔ Локацията е избрана успешно
        </div>
      )}
    </div>
  );
}

export default function AddParkingPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    cityId: "",
    parkingType: "PRIVATE",
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    priceText: "",
    approxCapacity: "",
  });

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === form.cityId) || null,
    [cities, form.cityId],
  );
  const handlePickLocation = async (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));

    try {
      const address = await reverseGeocode(lat, lng);

      if (address) {
        setForm((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
          address,
        }));
      }
    } catch {
      // тих fail, user пак може да въведе адрес ръчно
    }
  };
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`)
      .then((r) => r.json())
      .then(setCities);
  }, []);

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "420px 1fr",
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
            <h1 style={{ marginTop: 0 }}>Добави паркинг</h1>
            <p style={{ color: "#64748b", lineHeight: 1.5 }}>
              Избери град, попълни детайлите и цъкни на картата, за да зададеш
              точната локация.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setMessage("");
                if (!form.latitude || !form.longitude) {
                  setMessage("Моля, избери локация от картата.");
                  return;
                }
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/parkings`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      cityId: form.cityId,
                      parkingType: form.parkingType,
                      name: form.name,
                      address: form.address,
                      latitude: Number(form.latitude),
                      longitude: Number(form.longitude),
                      priceText: form.priceText,
                      approxCapacity: form.approxCapacity
                        ? Number(form.approxCapacity)
                        : null,
                    }),
                  },
                );

                if (!res.ok) {
                  setMessage("Възникна проблем при изпращането.");
                  return;
                }

                setMessage("Паркингът беше изпратен за одобрение.");
                setForm({
                  cityId: "",
                  parkingType: "PRIVATE",
                  name: "",
                  address: "",
                  latitude: "",
                  longitude: "",
                  priceText: "",
                  approxCapacity: "",
                });
              }}
              style={{ display: "grid", gap: 14 }}
            >
              <select
                value={form.cityId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, cityId: e.target.value }))
                }
                required
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

              <select
                value={form.parkingType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, parkingType: e.target.value }))
                }
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="PRIVATE">Частен</option>
                <option value="MUNICIPAL">Общински</option>
              </select>

              <input
                placeholder="Име"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                placeholder="Адрес"
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                required
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
                {form.latitude && form.longitude
                  ? "Локацията е избрана на картата."
                  : "Избери точната локация, като цъкнеш върху картата."}
              </div>

              <input
                placeholder="Цена (пример: 2.00 лв/час)"
                value={form.priceText}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, priceText: e.target.value }))
                }
                required
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                placeholder="Приблизителни места"
                value={form.approxCapacity}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    approxCapacity: e.target.value,
                  }))
                }
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                }}
              />

              <button
                type="submit"
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
                Изпрати за одобрение
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
            </form>
          </div>

          <AddParkingMap
            city={selectedCity}
            latitude={form.latitude}
            longitude={form.longitude}
            onPickLocation={handlePickLocation}
          />
        </div>
      </main>
    </>
  );
}
