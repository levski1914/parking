"use client";

import { useEffect, useState } from "react";

type PendingOwner = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: string;
  ownerType?: string | null;
  createdAt: string;
  organization?: {
    name: string;
    type?: string | null;
    cityId: string;
  } | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PendingOwner[]>([]);
  const [message, setMessage] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadUsers() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/pending-owners`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.log("USERS ERROR:", res.status, text);
      setMessage(`Грешка ${res.status}: ${text}`);
      return;
    }

    const data = await res.json();
    setUsers(data);
  }

  async function approve(id: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/approve`,
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res.ok) {
      setMessage("Потребителят беше одобрен.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  async function reject(id: string) {
    const ok = confirm("Сигурен ли си, че искаш да откажеш този потребител?");
    if (!ok) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/reject`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res.ok) {
      setMessage("Потребителят беше отказан.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Чакащи собственици / общини</h1>

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

      {users.length === 0 ? (
        <p style={{ color: "#64748b" }}>Няма чакащи заявки.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {users.map((user) => (
            <div
              key={user.id}
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
                <h3 style={{ margin: "0 0 8px 0" }}>
                  {user.firstName} {user.lastName || ""}
                </h3>

                <div
                  style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}
                >
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Тип:</strong> {user.ownerType || "-"}
                  </div>
                  <div>
                    <strong>Организация:</strong>{" "}
                    {user.organization?.name || "-"}
                  </div>
                  <div>
                    <strong>City ID:</strong> {user.organization?.cityId || "-"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => approve(user.id)}
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
                  onClick={() => reject(user.id)}
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
          ))}
        </div>
      )}
    </div>
  );
}
