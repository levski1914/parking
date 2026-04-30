"use client";

import { useEffect, useMemo, useState } from "react";
import { getToken } from "@/app/lib/auth";
import { useAuth } from "@/app/context/AuthProvider";

type Report = {
  id: string;
  targetType: "ZONE" | "PARKING";
  reason: string;
  note?: string | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED";
  createdAt: string;

  adminSeenAt?: string | null;
  ownerSeenAt?: string | null;
  actionTakenAt?: string | null;
  resolvedAt?: string | null;
  ownerNote?: string | null;
  adminNote?: string | null;

  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;

  parking?: {
    name: string;
  } | null;

  zone?: {
    name: string;
  } | null;
};

type Tab = "active" | "closed";

export default function AdminReportsPage() {
  const { user } = useAuth();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");
  const [message, setMessage] = useState("");

  async function apiPatch(url: string, body?: any) {
    const token = getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage(data?.message || "Възникна проблем.");
      return false;
    }

    await loadReports();
    return true;
  }

  async function loadReports() {
    const token = getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => []);
    setReports(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function markSeen(id: string) {
    setMessage("");
    await apiPatch(`/reports/${id}/seen`);
  }

  async function markActionTaken(id: string) {
    setMessage("");

    const note = prompt("Какви мерки са предприети?");
    if (note === null) return;

    await apiPatch(`/reports/${id}/action`, { note });
  }

  async function resolveReport(id: string) {
    setMessage("");

    const note = prompt("Бележка при приключване:");
    if (note === null) return;

    await apiPatch(`/reports/${id}/resolve`, { note });
  }

  async function rejectReport(id: string) {
    setMessage("");
    await apiPatch(`/reports/${id}/status/REJECTED`);
  }

  useEffect(() => {
    loadReports();
  }, []);

  const activeReports = useMemo(() => {
    return reports.filter(
      (r) => r.status === "OPEN" || r.status === "REVIEWED",
    );
  }, [reports]);

  const closedReports = useMemo(() => {
    return reports.filter(
      (r) => r.status === "RESOLVED" || r.status === "REJECTED",
    );
  }, [reports]);

  const visibleReports = tab === "active" ? activeReports : closedReports;

  function getTargetName(r: Report) {
    return r.targetType === "PARKING"
      ? r.parking?.name || "Паркинг"
      : r.zone?.name || "Зона";
  }

  function hoursSince(date: string) {
    return (Date.now() - new Date(date).getTime()) / 1000 / 60 / 60;
  }

  function getStatusStyle(status: Report["status"]) {
    if (status === "OPEN") return { background: "#fef3c7", color: "#92400e" };
    if (status === "REVIEWED")
      return { background: "#dbeafe", color: "#1d4ed8" };
    if (status === "RESOLVED")
      return { background: "#dcfce7", color: "#166534" };
    return { background: "#fee2e2", color: "#991b1b" };
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Сигнали</h1>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Следене на проблеми, реакции от собственици/общини и приключени
          случаи.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button
          onClick={() => setTab("active")}
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #cbd5e1",
            background: tab === "active" ? "#2563eb" : "#fff",
            color: tab === "active" ? "#fff" : "#0f172a",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Активни ({activeReports.length})
        </button>

        <button
          onClick={() => setTab("closed")}
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #cbd5e1",
            background: tab === "closed" ? "#2563eb" : "#fff",
            color: tab === "closed" ? "#fff" : "#0f172a",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Приключени ({closedReports.length})
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 10,
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div>Зареждане...</div>
      ) : visibleReports.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 14,
            padding: 20,
            color: "#64748b",
          }}
        >
          {tab === "active"
            ? "Няма активни сигнали."
            : "Няма приключени случаи."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {visibleReports.map((r) => {
            const stale = !r.ownerSeenAt && hoursSince(r.createdAt) > 8;
            const statusStyle = getStatusStyle(r.status);

            return (
              <div
                key={r.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: stale ? "1px solid #dc2626" : "1px solid #e2e8f0",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 18 }}>{getTargetName(r)}</strong>

                    <div
                      style={{ fontSize: 14, color: "#475569", marginTop: 4 }}
                    >
                      {r.targetType === "PARKING" ? "Паркинг" : "Зона"} •{" "}
                      {r.reason}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "5px 9px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      ...statusStyle,
                    }}
                  >
                    {r.status}
                  </span>
                </div>

                {r.note && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 10,
                      background: "#f8fafc",
                      color: "#334155",
                      fontSize: 14,
                    }}
                  >
                    📝 {r.note}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 8,
                    fontSize: 13,
                    color: "#475569",
                  }}
                >
                  <div>👁 Owner прочел: {r.ownerSeenAt ? "Да" : "Не"}</div>
                  <div>🛠 Мерки: {r.actionTakenAt ? "Да" : "Не"}</div>
                  <div>✅ Приключен: {r.resolvedAt ? "Да" : "Не"}</div>
                  <div>📅 {new Date(r.createdAt).toLocaleString("bg-BG")}</div>
                </div>

                {stale && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 10,
                      background: "#fef2f2",
                      color: "#991b1b",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ Няма реакция от owner/община над 8 часа.
                  </div>
                )}

                {r.ownerNote && (
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    <strong>Бележка от owner:</strong> {r.ownerNote}
                  </div>
                )}

                {r.adminNote && (
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    <strong>Admin бележка:</strong> {r.adminNote}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={() => markSeen(r.id)} style={buttonStyle}>
                    Маркирай видяно
                  </button>

                  <button
                    onClick={() => markActionTaken(r.id)}
                    style={buttonStyle}
                  >
                    Предприети мерки
                  </button>

                  {user?.role === "ADMIN" && (
                    <>
                      <button
                        onClick={() => resolveReport(r.id)}
                        style={{
                          ...buttonStyle,
                          background: "#16a34a",
                          color: "#fff",
                          border: "1px solid #16a34a",
                        }}
                      >
                        Приключи
                      </button>

                      <button
                        onClick={() => rejectReport(r.id)}
                        style={{
                          ...buttonStyle,
                          background: "#dc2626",
                          color: "#fff",
                          border: "1px solid #dc2626",
                        }}
                      >
                        Отхвърли
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: 9,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};
