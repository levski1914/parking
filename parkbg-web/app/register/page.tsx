"use client";

import { Navbar } from "@/app/components/layout/navbar";
import { setToken } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type City = {
  id: string;
  name: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [cities, setCities] = useState<City[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CLIENT",
    ownerType: "",
    organizationName: "",
    cityId: "",
  });

  const isOwner = form.role === "OWNER";

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cities`)
      .then((r) => r.json())
      .then(setCities);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const payload: any = {
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      role: form.role,
    };

    if (isOwner) {
      payload.ownerType = form.ownerType;
      payload.organizationName = form.organizationName;
      payload.cityId = form.cityId;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      setMessage("Проблем при регистрацията.");
      return;
    }

    const data = await res.json();

    if (isOwner) {
      setMessage("Заявката е изпратена. Акаунтът чака одобрение от админ.");
      return;
    }

    setToken(data.access_token);
    router.push("/");
  }

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h1 style={{ marginTop: 0 }}>Регистрация</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
              <input
                type="email"
                placeholder="Имейл"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Парола"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                style={inputStyle}
              />

              <input
                placeholder="Име"
                value={form.firstName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
                required
                style={inputStyle}
              />

              <input
                placeholder="Фамилия"
                value={form.lastName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
                style={inputStyle}
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value,
                    ownerType: "",
                    organizationName: "",
                    cityId: "",
                  }))
                }
                style={inputStyle}
              >
                <option value="CLIENT">Клиент</option>
                <option value="OWNER">Собственик / Община</option>
              </select>

              {isOwner && (
                <>
                  <select
                    value={form.ownerType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ownerType: e.target.value,
                      }))
                    }
                    required
                    style={inputStyle}
                  >
                    <option value="">Избери тип</option>
                    <option value="PRIVATE">Частен собственик</option>
                    <option value="MUNICIPALITY">Община</option>
                  </select>

                  <input
                    placeholder="Име на организация"
                    value={form.organizationName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        organizationName: e.target.value,
                      }))
                    }
                    required
                    style={inputStyle}
                  />

                  <select
                    value={form.cityId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cityId: e.target.value }))
                    }
                    required
                    style={inputStyle}
                  >
                    <option value="">Избери град</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#fff7ed",
                      border: "1px solid #fdba74",
                      color: "#9a3412",
                      fontSize: 14,
                    }}
                  >
                    Собственици и общини трябва да бъдат одобрени от админ.
                  </div>
                </>
              )}

              <button type="submit" style={primaryButtonStyle}>
                Регистрирай се
              </button>

              {message && <div style={infoStyle}>{message}</div>}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

const inputStyle = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
};

const primaryButtonStyle = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid #2563eb",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const infoStyle = {
  padding: 12,
  borderRadius: 10,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  color: "#1d4ed8",
};
