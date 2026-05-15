import { AdminNavbar } from "@/app/components/layout/admin-navbar";
import { PendingApprovalBanner } from "../components/auth/pending-approval-banner";
import { AuthProvider } from "../context/AuthProvider";
import { AdminGuard } from "../components/auth/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminNavbar />

      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <AdminGuard allowMunicipality allowPrivate>
            {children}
          </AdminGuard>
        </div>
      </main>
    </>
  );
}
