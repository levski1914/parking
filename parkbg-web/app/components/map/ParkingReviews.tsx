"use client";

import { useEffect, useState } from "react";
//import { getToken } from "@/app/lib/auth";

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

type Summary = {
  average: number;
  count: number;
};

export function ParkingReviews({ parkingId }: { parkingId: string }) {
  const [summary, setSummary] = useState<Summary>({ average: 0, count: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  async function loadReviews() {
    const [summaryRes, reviewsRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/parking/${parkingId}/summary`,
      ),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/parking/${parkingId}`),
    ]);

    setSummary(await summaryRes.json());
    setReviews(await reviewsRes.json());
  }

  async function submitReview() {
    setMessage("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parkingId,
        rating,
        comment,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401 || res.status === 403) {
      setMessage("Влез в профила си, за да оставиш отзив.");
      return;
    }

    if (!res.ok) {
      setMessage(data?.message || "Проблем при изпращането.");
      return;
    }

    setComment("");
    setRating(5);
    await loadReviews();
  }

  useEffect(() => {
    loadReviews();
  }, [parkingId]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700 }}>⭐ {summary.average || "-"} / 5</div>
        <div style={{ color: "#64748b", fontSize: 13 }}>
          {summary.count} отзива
        </div>
      </div>

      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 24,
              color: star <= rating ? "#f59e0b" : "#cbd5e1",
            }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Напиши отзив..."
        rows={3}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          resize: "vertical",
        }}
      />

      <button
        onClick={submitReview}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #2563eb",
          background: "#2563eb",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Изпрати отзив
      </button>

      {message && (
        <div style={{ color: "#dc2626", fontSize: 14 }}>{message}</div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {reviews.map((review) => (
          <div
            key={review.id}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "#fff",
            }}
          >
            <div style={{ color: "#f59e0b" }}>
              {"★".repeat(review.rating)}
              <span style={{ color: "#cbd5e1" }}>
                {"★".repeat(5 - review.rating)}
              </span>
            </div>

            <div style={{ fontWeight: 600, marginTop: 4 }}>
              {review.user?.firstName || "Потребител"}
            </div>

            {review.comment && (
              <div style={{ color: "#475569", marginTop: 4 }}>
                {review.comment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
