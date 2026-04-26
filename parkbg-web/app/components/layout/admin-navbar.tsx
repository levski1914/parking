"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/parkings", label: "Чакащи" },
  { href: "/admin/parkings/all", label: "Паркинги" },
  { href: "/admin/zones", label: "Добави зона" },
  { href: "/admin/zones-list", label: "Зони" },
  { href: "/admin/users", label: "Заявки" },
];

export function AdminNavbar() {
  const pathname = usePathname();

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
        {/* LEFT */}
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
        </div>

        {/* RIGHT */}
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
