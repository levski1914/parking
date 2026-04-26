"use client";

import { useEffect, useState } from "react";

type PendingParking = {
  id: string;
  name: string;
  parkingType: "PRIVATE" | "MUNICIPAL";
  address: string;
  priceText: string;
  approxCapacity?: number | null;
  city?: {
    name: string;
  };
};

export default function AdminParkingsPage() {
  const [parkings, setParkings] = useState<PendingParking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPending() {
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parkings/pending`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      setMessage("Неуспешно зареждане на чакащите паркинги.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setParkings(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "APPROVED" | "REJECTED") {
    setMessage("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}/status/${status}`,
      {
        method: "PATCH",
      },
    );

    if (!res.ok) {
      setMessage("Възникна проблем при обновяването.");
      return;
    }

    setMessage(
      status === "APPROVED"
        ? "Паркингът беше одобрен."
        : "Паркингът беше отхвърлен.",
    );

    await loadPending();
  }

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <>
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
            <h1 style={{ marginTop: 0 }}>Админ — чакащи паркинги</h1>
            <p style={{ color: "#64748b" }}>
              Тук одобряваш или отказваш новоизпратени паркинги.
            </p>

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

            {loading ? (
              <p>Зареждане...</p>
            ) : parkings.length === 0 ? (
              <p>Няма чакащи паркинги.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {parkings.map((parking) => (
                  <div
                    key={parking.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: "0 0 8px 0" }}>{parking.name}</h3>

                        <div
                          style={{
                            color: "#475569",
                            fontSize: 14,
                            lineHeight: 1.7,
                          }}
                        >
                          <div>
                            <strong>Град:</strong> {parking.city?.name || "-"}
                          </div>
                          <div>
                            <strong>Тип:</strong>{" "}
                            {parking.parkingType === "MUNICIPAL"
                              ? "Общински"
                              : "Частен"}
                          </div>
                          <div>
                            <strong>Адрес:</strong> {parking.address}
                          </div>
                          <div>
                            <strong>Цена:</strong> {parking.priceText}
                          </div>
                          <div>
                            <strong>Места:</strong>{" "}
                            {parking.approxCapacity ?? "-"}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => updateStatus(parking.id, "APPROVED")}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #16a34a",
                            background: "#16a34a",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Одобри
                        </button>

                        <button
                          onClick={() => updateStatus(parking.id, "REJECTED")}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid #dc2626",
                            background: "#dc2626",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Откажи
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
