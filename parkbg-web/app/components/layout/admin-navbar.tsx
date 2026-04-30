"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthProvider"; // смени пътя ако е различен

type TokenPayload = {
  role: "ADMIN" | "OWNER" | "CLIENT";
  ownerType?: "MUNICIPALITY" | "PRIVATE" | null;
  organizationId?: string | null;
  isVerified?: boolean;
};
const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Заявки" },
  { href: "/admin/parkings", label: "Чакащи" },
  { href: "/admin/parkings/all", label: "Паркинги" },
  { href: "/admin/zones", label: "Добави зона" },
  { href: "/admin/reports", label: "Сигнали" },
  { href: "/admin/zones-list", label: "Зони" },
];

const municipalOwnerLinks = [
  { href: "/admin/zones-list", label: "Моите зони" },
  { href: "/admin/zones", label: "Добави зона" },
  { href: "/admin/parkings/all", label: "Моите общински паркинги" },
  { href: "/admin/reports", label: "Сигнали" },
];

const privateOwnerLinks = [
  { href: "/admin/parkings/all", label: "Моите паркинги" },
  { href: "/admin/parkings/new", label: "Добави паркинг" },
  { href: "/admin/reports", label: "Сигнали" },
];

function getLinks(payload: TokenPayload | null) {
  if (!payload) return [];

  if (payload.role === "ADMIN") {
    return adminLinks;
  }

  if (payload.role === "OWNER" && payload.isVerified === false) {
    return [];
  }

  if (payload.role === "OWNER" && payload.ownerType === "MUNICIPALITY") {
    return municipalOwnerLinks;
  }

  if (payload.role === "OWNER" && payload.ownerType === "PRIVATE") {
    return privateOwnerLinks;
  }

  return [];
}

export function AdminNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // const payload = getTokenPayload() as TokenPayload | null;
  if (loading) return null;

  const links = getLinks(user);

  const isPendingOwner = user?.role === "OWNER" && user.isVerified === false;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link
            href="/admin"
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            ParkBG Admin
          </Link>

          {isPendingOwner ? (
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "#92400e",
                color: "#fff7ed",
                fontSize: 14,
              }}
            >
              Профилът чака одобрение
            </span>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: 14,
                      background: active ? "#1e293b" : "transparent",
                      color: active ? "#fff" : "#cbd5f5",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Към сайта
          </Link>
        </div>
      </div>
    </nav>
  );
}
