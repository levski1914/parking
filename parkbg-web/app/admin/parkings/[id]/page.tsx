"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditParkingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}`)
      .then((r) => r.json())
      .then(setForm);
  }, [id]);

  if (!form) return <p>Loading...</p>;

  async function save() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/admin/parkings");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Редакция на паркинг</h1>

      <input
        value={form.name}
        onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
      />

      <input
        value={form.priceText}
        onChange={(e) =>
          setForm((p: any) => ({ ...p, priceText: e.target.value }))
        }
      />

      <button onClick={save}>Запази</button>
    </div>
  );
}
