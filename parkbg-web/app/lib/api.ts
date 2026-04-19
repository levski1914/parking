export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function getCities() {
  const res = await fetch(`${API_URL}/cities`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch cities");
  }

  return res.json();
}

export async function getZones(cityId: string) {
  const res = await fetch(`${API_URL}/zones?cityId=${cityId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch zones");
  }

  return res.json();
}

export async function getParkings(cityId: string) {
  const res = await fetch(`${API_URL}/parkings?cityId=${cityId}`, {
    cache: "no-store",
  });

  return res.json();
}
