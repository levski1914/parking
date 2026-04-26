"use client";

import { Navbar } from "@/app/components/layout/navbar";
import { setToken } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setMessage("Грешен имейл, парола или акаунтът още не е одобрен.");
      return;
    }

    const data = await res.json();

    setToken(data.access_token);
    router.push("/admin");
  }

  return (
    <>
      <Navbar />

      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h1 style={{ marginTop: 0 }}>Вход</h1>

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

              <button type="submit" style={primaryButtonStyle}>
                Влез
              </button>

              {message && <div style={errorStyle}>{message}</div>}
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

const errorStyle = {
  padding: 12,
  borderRadius: 10,
  background: "#fee2e2",
  border: "1px solid #fecaca",
  color: "#991b1b",
};
