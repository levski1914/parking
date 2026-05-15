"use client";

import { useAuth } from "@/app/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

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

  const allowed = useMemo(() => {
    if (!user) return false;

    if (allowAdmin && user.role === "ADMIN") return true;

    if (
      allowMunicipality &&
      user.role === "OWNER" &&
      user.ownerType === "MUNICIPALITY" &&
      user.isVerified
    ) {
      return true;
    }

    if (
      allowPrivate &&
      user.role === "OWNER" &&
      user.ownerType === "PRIVATE" &&
      user.isVerified
    ) {
      return true;
    }

    return false;
  }, [user, allowAdmin, allowMunicipality, allowPrivate]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "OWNER" && !user.isVerified) {
      router.replace("/profile");
      return;
    }

    if (!allowed) {
      router.replace("/");
    }
  }, [user, loading, allowed, router]);

  if (loading) return null;
  if (!user) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
