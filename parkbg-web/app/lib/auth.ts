export async function getMe() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch (err) {
    console.error("getMe error:", err);
    return null;
  }
}

export async function logoutRequest() {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  window.dispatchEvent(new Event("auth-changed"));
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth-changed"));
}
