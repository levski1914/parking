"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthProvider";

const adminItems = [
  {
    title: "Заявки",
    description: "Одобряване на owner/община профили",
    href: "/admin/users",
    badge: "Owners",
  },
  {
    title: "Чакащи паркинги",
    description: "Одобряване и отказване на нови паркинги",
    href: "/admin/parkings",
    badge: "Модерация",
  },
  {
    title: "Всички паркинги",
    description: "Редакция, изтриване и управление",
    href: "/admin/parkings/all",
    badge: "CRUD",
  },
  {
    title: "Добави зона",
    description: "Очертаване на зона върху картата",
    href: "/admin/zones",
    badge: "Map editor",
  },
  {
    title: "Зони",
    description: "Преглед, редакция и изтриване на зони",
    href: "/admin/zones-list",
    badge: "Zones",
  },
];

const municipalityItems = [
  {
    title: "Моите зони",
    description: "Преглед, редакция и изтриване на общински зони",
    href: "/admin/zones-list",
    badge: "Zones",
  },
  {
    title: "Добави зона",
    description: "Очертаване на нова общинска зона",
    href: "/admin/zones",
    badge: "Map editor",
  },
  {
    title: "Моите общински паркинги",
    description: "Управление на паркингите към твоята организация",
    href: "/admin/parkings/all",
    badge: "Parkings",
  },
];

const privateItems = [
  {
    title: "Моите паркинги",
    description: "Преглед и управление на твоите паркинги",
    href: "/admin/parkings/all",
    badge: "Parkings",
  },
  {
    title: "Добави паркинг",
    description: "Добавяне на нов частен паркинг",
    href: "/add-parking",
    badge: "New",
  },
];

function getItems(user: any) {
  if (user?.role === "ADMIN") return adminItems;

  if (user?.role === "OWNER" && user?.ownerType === "MUNICIPALITY") {
    return municipalityItems;
  }

  if (user?.role === "OWNER" && user?.ownerType === "PRIVATE") {
    return privateItems;
  }

  return [];
}

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const items = getItems(user);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>
          {user?.role === "ADMIN" ? "Админ панел" : "Моят панел"}
        </h1>

        <p style={{ color: "#64748b", marginTop: 8 }}>
          {user?.role === "ADMIN"
            ? "Управление на паркинги, зони и чакащи заявки."
            : "Управление на обектите към твоята организация."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                padding: 20,
                color: "#0f172a",
                minHeight: 150,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  marginBottom: 14,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </div>

              <h2 style={{ margin: "0 0 8px 0", fontSize: 22 }}>
                {item.title}
              </h2>

              <p style={{ margin: 0, color: "#64748b", lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
