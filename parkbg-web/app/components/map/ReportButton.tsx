"use client";

import { useState } from "react";
// import { getToken } from "@/app/lib/auth";

type Props = {
  targetType: "PARKING" | "ZONE";
  targetId: string;
};

const reasons = [
  "Грешна цена",
  "Грешен адрес",
  "Обектът не съществува",
  "Обектът е затворен",
  "Грешна информация",
  "Друго",
];

export function ReportButton({ targetType, targetId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  async function submitReport() {
    setMessage("");

    // const token = getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId,
        reason,
        note,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setMessage(data?.message || "Проблем при изпращането.");
      return;
    }

    setMessage("Сигналът беше изпратен. Благодарим!");
    setNote("");

    setTimeout(() => {
      setOpen(false);
      setMessage("");
    }, 1200);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          background: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Докладвай проблем
      </button>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 12,
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <strong>Докладвай проблем</strong>

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          background: "#fff",
        }}
      >
        {reasons.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Допълнителна информация..."
        rows={3}
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          resize: "vertical",
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={submitReport}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #dc2626",
            background: "#dc2626",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Изпрати
        </button>

        <button
          onClick={() => setOpen(false)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #cbd5e1",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Отказ
        </button>
      </div>

      {message && (
        <div style={{ fontSize: 14, color: "#16a34a" }}>{message}</div>
      )}
    </div>
  );
}
