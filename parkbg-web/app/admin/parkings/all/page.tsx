"use client";

import { getToken } from "@/app/lib/auth"; // смени пътя ако е друг
import Link from "next/link";
import { useEffect, useState } from "react";
type Parking = {
  id: string;
  name: string;
  parkingType: "PRIVATE" | "MUNICIPAL";
  address: string;
  priceText: string;
  approxCapacity?: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  city?: { name: string };
};

export default function AdminAllParkingsPage() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [message, setMessage] = useState("");

  async function loadParkings() {
    const token = getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parkings/all`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Нямаш достъп до паркингите.");
      setParkings([]);
      return;
    }

    if (!Array.isArray(data)) {
      setMessage("Невалиден отговор от сървъра.");
      setParkings([]);
      return;
    }

    setParkings(data);
  }

  async function deleteParking(id: string) {
    const ok = confirm("Сигурен ли си, че искаш да изтриеш този паркинг?");
    if (!ok) return;

    const token = getToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage(data?.message || "Проблем при изтриването.");
      return;
    }

    setMessage("Паркингът беше изтрит.");
    setParkings((prev) => prev.filter((p) => p.id !== id));
  }

  useEffect(() => {
    loadParkings();
  }, []);

  return (
    <>
      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ marginTop: 0 }}>Всички паркинги</h1>

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
            {parkings.map((parking) => (
              <div
                key={parking.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 8px 0" }}>{parking.name}</h3>
                  <div
                    style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}
                  >
                    <div>
                      <strong>Град:</strong> {parking.city?.name || "-"}
                    </div>
                    <div>
                      <strong>Тип:</strong> {parking.parkingType}
                    </div>
                    <div>
                      <strong>Адрес:</strong> {parking.address}
                    </div>
                    <div>
                      <strong>Цена:</strong> {parking.priceText}
                    </div>
                    <div>
                      <strong>Статус:</strong> {parking.status}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                  <Link
                    href={`/admin/parkings/${parking.id}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    Редактирай
                  </Link>

                  <button
                    onClick={() => deleteParking(parking.id)}
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
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
