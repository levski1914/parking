"use client";

import { Navbar } from "@/app/components/layout/navbar";
import { useEffect, useState } from "react";

type Me = {
  userId: string;
  role: string;
  ownerType?: string | null;
  organizationId?: string | null;
  isVerified?: boolean;
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
      .then((r) => r.json())
      .then(setMe);
  }, []);

  return (
    <>
      <Navbar />

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
            <h1 style={{ marginTop: 0 }}>Моят профил</h1>

            {!me ? (
              <p>Не си логнат.</p>
            ) : (
              <>
                {me.role === "OWNER" && !me.isVerified && (
                  <div
                    style={{
                      marginBottom: 18,
                      padding: 14,
                      borderRadius: 12,
                      background: "#fff7ed",
                      border: "1px solid #fdba74",
                      color: "#9a3412",
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Акаунтът чака одобрение.</strong>
                    <br />
                    Ще получиш достъп до админ панела след преглед от ParkBG.
                  </div>
                )}

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <strong>Роля:</strong> {me.role}
                  </div>
                  <div>
                    <strong>Тип:</strong> {me.ownerType || "-"}
                  </div>
                  <div>
                    <strong>Статус:</strong>{" "}
                    {me.role === "OWNER"
                      ? me.isVerified
                        ? "Одобрен"
                        : "Чака одобрение"
                      : "Активен"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
