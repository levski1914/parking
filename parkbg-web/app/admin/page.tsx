import Link from "next/link";

const items = [
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

export default function AdminPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 34 }}>Админ панел</h1>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Управление на паркинги, зони и чакащи заявки.
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
