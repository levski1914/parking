export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("auth-changed"));
}

export function removeToken() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-changed"));
}
export async function getMe() {
  const token = getToken();

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      removeToken();
      return null;
    }

    if (!res.ok) {
      console.error("getMe failed:", res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error("getMe network error:", err);
    return null;
  }
}
