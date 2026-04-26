import { AdminNavbar } from "@/app/components/layout/admin-navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNavbar />
      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>{children}</div>
      </main>
    </>
  );
}
