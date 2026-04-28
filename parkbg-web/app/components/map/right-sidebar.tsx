"use client";

import { Parking } from "./ParkingMap";

interface AvailabilityParking extends Parking {
  availabilityLabel: string;
}

type Props = {
  visibleParkings: Parking[];
  availabilityNow: AvailabilityParking[];
  selectedParkingId?: string | null;
  onSelectParkingFromList: (p: Parking) => void;
};

export function RightSidebar({
  visibleParkings,
  availabilityNow,
  selectedParkingId,
  onSelectParkingFromList,
}: Props) {
  return (
    <aside
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 14,
        display: "grid",
        gap: 16,
      }}
    >
      <section>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
          Паркинги в този район ({visibleParkings.length})
        </div>

        {visibleParkings.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>
            Няма паркинги в текущия изглед
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 10,
              maxHeight: 280,
              overflowY: "auto",
              paddingRight: 2,
            }}
          >
            {visibleParkings.map((p) => {
              const isSelected = selectedParkingId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectParkingFromList(p)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    cursor: "pointer",
                    background: isSelected ? "#eff6ff" : "#fff",
                    border: isSelected
                      ? "1px solid #93c5fd"
                      : "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontWeight: 600, lineHeight: 1.4 }}>
                    {p.name}
                  </div>

                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    {p.parkingType === "MUNICIPAL" ? "Общински" : "Частен"}
                  </div>

                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {p.priceText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
          Свободни места сега
        </div>

        {availabilityNow.length === 0 ? (
          <p style={{ color: "#64748b", margin: 0 }}>
            Няма достатъчно данни за текущия изглед.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {availabilityNow.map((p) => (
              <div
                key={`availability-${p.id}`}
                onClick={() => onSelectParkingFromList(p)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  background: "#fff",
                }}
              >
                <div style={{ fontWeight: 600, lineHeight: 1.4 }}>{p.name}</div>

                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {p.availabilityLabel}
                </div>

                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {p.approxCapacity
                    ? `Капацитет: ~${p.approxCapacity}`
                    : "Няма подаден капацитет"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
