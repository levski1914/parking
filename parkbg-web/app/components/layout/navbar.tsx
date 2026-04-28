"use client";

import { useAuth } from "@/app/context/AuthProvider";
import Link from "next/link";

export function Navbar({ citySlug }: { citySlug?: string }) {
  const { user, loading, logout } = useAuth();

  const canSeeAdmin =
    user?.role === "ADMIN" ||
    (user?.role === "OWNER" && user?.isVerified === true);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#0f172a",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ParkBG
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#475569",
                fontSize: 15,
              }}
            >
              Градове
            </Link>

            {citySlug && (
              <Link
                href={`/${citySlug}`}
                style={{
                  textDecoration: "none",
                  color: "#475569",
                  fontSize: 15,
                }}
              >
                Карта
              </Link>
            )}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/add-parking"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              cursor: "pointer",
              textDecoration: "none",
              color: "#0f172a",
            }}
          >
            Добави паркинг
          </Link>

          {!loading && canSeeAdmin && <Link href="/admin">Админ</Link>}

          {!loading && !user ? (
            <>
              <Link
                href="/login"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #2563eb",
                  background: "#2563eb",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                Вход
              </Link>

              <Link
                href="/register"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                Регистрация
              </Link>
            </>
          ) : (
            !loading &&
            user && (
              <>
                <Link href="/profile">Профил</Link>

                <button onClick={logout}>Изход</button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
