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

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    removeToken();
    return null;
  }

  return res.json();
}
