"use client";

import { AdminNavbar } from "@/app/components/layout/admin-navbar";

import { useEffect, useMemo, useState } from "react";

type City = {
  id: string;
  name: string;
  slug: string;
};

type Zone = {
  id: string;
  name: string;
  zoneType: "BLUE" | "GREEN" | "PINK" | "OTHER";
  priceText: string;
  smsNumber?: string | null;
  smsTemplate?: string | null;
};

export default function AdminZonesListPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [message, setMessage] = useState("");

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === cityId) || null,
    [cities, cityId],
  );

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setCities(data);
        if (data.length > 0) {
          setCityId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!cityId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/zones?cityId=${cityId}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then(setZones);
  }, [cityId]);

  async function deleteZone(id: string) {
    setMessage("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/zones/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setMessage("Проблем при изтриването на зоната.");
      return;
    }

    setMessage("Зоната беше изтрита.");
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Админ — зони</h1>
          <p style={{ color: "#64748b" }}>
            Преглед и изтриване на зони по град.
          </p>

          <div style={{ marginBottom: 16 }}>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                minWidth: 240,
              }}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {message && (
            <div
              style={{
                marginBottom: 16,
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

          <div style={{ display: "grid", gap: 12 }}>
            {zones.length === 0 ? (
              <p>Няма зони за {selectedCity?.name || "избрания град"}.</p>
            ) : (
              zones.map((zone) => (
                <div
                  key={zone.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 8px 0" }}>{zone.name}</h3>
                    <div
                      style={{
                        color: "#475569",
                        fontSize: 14,
                        lineHeight: 1.7,
                      }}
                    >
                      <div>
                        <strong>Тип:</strong> {zone.zoneType}
                      </div>
                      <div>
                        <strong>Цена:</strong> {zone.priceText}
                      </div>
                      <div>
                        <strong>SMS:</strong> {zone.smsNumber || "-"}
                      </div>
                      <div>
                        <strong>Пример:</strong> {zone.smsTemplate || "-"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteZone(zone.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #dc2626",
                      background: "#dc2626",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Изтрий
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
