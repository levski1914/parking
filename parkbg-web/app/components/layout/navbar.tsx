"use client";

import { useAuth } from "@/app/context/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar({ citySlug }: { citySlug?: string }) {
  const { user, loading, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const canSeeAdmin =
    user?.role === "ADMIN" ||
    (user?.role === "OWNER" && user?.isVerified === true);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 760);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 80,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: isMobile ? "12px 14px" : "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            onClick={closeMenu}
            style={{
              textDecoration: "none",
              color: "#0f172a",
              fontSize: isMobile ? 26 : 28,
              fontWeight: 700,
            }}
          >
            ParkBG
          </Link>

          {!isMobile && (
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
          )}
        </div>

        {!isMobile ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/admin/parkings/new"
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
        ) : (
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Отвори меню"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#fff",
              fontSize: 24,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <>
          <div
            onClick={closeMenu}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.35)",
              zIndex: 90,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: 280,
              maxWidth: "86vw",
              background: "#fff",
              zIndex: 100,
              boxShadow: "-12px 0 30px rgba(15,23,42,0.18)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong style={{ fontSize: 22 }}>ParkBG</strong>

              <button
                onClick={closeMenu}
                aria-label="Затвори меню"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <Link href="/" onClick={closeMenu}>
              Градове
            </Link>

            {citySlug && (
              <Link href={`/${citySlug}`} onClick={closeMenu}>
                Карта
              </Link>
            )}

            <Link href="/add-parking" onClick={closeMenu}>
              Добави паркинг
            </Link>

            {!loading && canSeeAdmin && (
              <Link href="/admin" onClick={closeMenu}>
                Админ
              </Link>
            )}

            <div
              style={{
                height: 1,
                background: "#e2e8f0",
                margin: "8px 0",
              }}
            />

            {!loading && !user ? (
              <>
                <Link href="/login" onClick={closeMenu}>
                  Вход
                </Link>

                <Link href="/register" onClick={closeMenu}>
                  Регистрация
                </Link>
              </>
            ) : (
              !loading &&
              user && (
                <>
                  <Link href="/profile" onClick={closeMenu}>
                    Профил
                  </Link>

                  <button
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    style={{
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Изход
                  </button>
                </>
              )
            )}
          </aside>
        </>
      )}
    </header>
  );
}
