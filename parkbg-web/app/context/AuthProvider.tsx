"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getMe, getToken, removeToken } from "@/app/lib/auth";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "ADMIN" | "OWNER" | "CLIENT";
  ownerType?: "MUNICIPALITY" | "PRIVATE" | null;
  organizationId?: string | null;
  isVerified?: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    const token = getToken();

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const me = await getMe();
    setUser(me);
    setLoading(false);
  }

  function logout() {
    removeToken();
    setUser(null);
    window.location.href = "/";
  }

  useEffect(() => {
    refreshUser();

    window.addEventListener("auth-changed", refreshUser);

    return () => {
      window.removeEventListener("auth-changed", refreshUser);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
