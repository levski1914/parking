"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function PendingApprovalBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setShow(payload.role === "OWNER" && payload.isVerified === false);
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        background: "#fff7ed",
        borderBottom: "1px solid #fdba74",
        color: "#9a3412",
        padding: "10px 24px",
        fontSize: 14,
        textAlign: "center",
      }}
    >
      Акаунтът ти чака одобрение.{" "}
      <Link href="/profile" style={{ color: "#9a3412", fontWeight: 700 }}>
        Виж статус
      </Link>
    </div>
  );
}
