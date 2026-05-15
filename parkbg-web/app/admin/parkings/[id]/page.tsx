"use client";

// import { getToken } from "@/app/lib/auth"; // смени пътя ако е друг
import { useAuth } from "@/app/context/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditParkingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [form, setForm] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadParking() {
      // const token = getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Нямаш достъп до този паркинг.");
        return;
      }

      setForm({
        name: data.name || "",
        parkingType: data.parkingType || "PRIVATE",
        address: data.address || "",
        latitude: data.latitude || "",
        phone: data.phone || "",
        longitude: data.longitude || "",
        priceText: data.priceText || "",
        approxCapacity: data.approxCapacity ?? "",
        status: data.status || "PENDING",
      });
    }

    loadParking();
  }, [id]);

  async function save() {
    setMessage("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          approxCapacity: form.approxCapacity
            ? Number(form.approxCapacity)
            : null,
        }),
      },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage(data?.message || "Проблем при записването.");
      return;
    }

    router.push("/admin/parkings/all");
  }

  if (message && !form) {
    return <main style={{ padding: 24 }}>{message}</main>;
  }

  if (!form) {
    return <main style={{ padding: 24 }}>Зареждане...</main>;
  }

  const inputStyle = {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Редакция на паркинг</h1>

          <div style={{ display: "grid", gap: 14 }}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Име"
              style={inputStyle}
            />

            <select
              value={form.parkingType}
              onChange={(e) =>
                setForm({ ...form, parkingType: e.target.value })
              }
              style={inputStyle}
            >
              <option value="PRIVATE">Частен</option>
              <option value="MUNICIPAL">Общински</option>
            </select>

            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Адрес"
              style={inputStyle}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <input
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="Latitude"
                style={inputStyle}
              />
              <input
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                placeholder="Longitude"
                style={inputStyle}
              />
            </div>

            <input
              value={form.priceText}
              onChange={(e) => setForm({ ...form, priceText: e.target.value })}
              placeholder="Цена"
              style={inputStyle}
            />

            <input
              value={form.approxCapacity}
              onChange={(e) =>
                setForm({ ...form, approxCapacity: e.target.value })
              }
              placeholder="Приблизителни места"
              style={inputStyle}
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Телефон за връзка"
              style={inputStyle}
            />
            {user?.role === "ADMIN" && (
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}

            <button
              onClick={save}
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
              Запази
            </button>

            {message && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
