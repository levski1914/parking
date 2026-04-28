"use client";

import { useAuth } from "@/app/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  allowAdmin?: boolean;
  allowMunicipality?: boolean;
  allowPrivate?: boolean;
};

export function AdminGuard({
  children,
  allowAdmin = true,
  allowMunicipality = false,
  allowPrivate = false,
}: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed =
    user?.role === "ADMIN" ||
    (allowMunicipality &&
      user?.role === "OWNER" &&
      user.ownerType === "MUNICIPALITY" &&
      user.isVerified) ||
    (allowPrivate &&
      user?.role === "OWNER" &&
      user.ownerType === "PRIVATE" &&
      user.isVerified);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "OWNER" && !user.isVerified) {
      router.push("/profile");
      return;
    }

    if (!allowed) {
      router.push("/");
    }
  }, [user, loading, allowed, router]);

  if (loading) return null;
  if (!user) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
