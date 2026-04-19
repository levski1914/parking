"use client";

import { Parking, SelectedItem } from "./varna-map";

type SidebarProps = {
  selectedItem: SelectedItem | null;
  showZones: boolean;
  showMunicipal: boolean;
  showPrivate: boolean;
  onToggleZones: () => void;
  onToggleMunicipal: () => void;
  onTogglePrivate: () => void;
  nothingVisible: boolean;
  onClearSelected: () => void;
  visibleParkings: Parking[];
  onSelectParkingFromList: (p: Parking) => void;
};

const zoneTypeLabel: Record<string, string> = {
  BLUE: "Синя зона",
  GREEN: "Зелена зона",
  PINK: "Розова зона",
  OTHER: "Друга зона",
};

const parkingTypeLabel: Record<string, string> = {
  MUNICIPAL: "Общински паркинг",
  PRIVATE: "Частен паркинг",
};

export function Sidebar({
  selectedItem,
  showZones,
  showMunicipal,
  showPrivate,
  onToggleZones,
  onToggleMunicipal,
  onTogglePrivate,
  nothingVisible,
  onClearSelected,
  visibleParkings,
  onSelectParkingFromList,
}: SidebarProps) {
  return (
    <aside
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 18,
        minHeight: 600,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 30 }}>ParkBG</h2>
        <p style={{ margin: "8px 0 0 0", color: "#475569", lineHeight: 1.5 }}>
          Паркиране, зони и информация за Варна
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
          Слоеве
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            onClick={onToggleZones}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: showZones ? "#2563eb" : "#fff",
              color: showZones ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            Зони
          </button>

          <button
            onClick={onToggleMunicipal}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: showMunicipal ? "#f59e0b" : "#fff",
              color: showMunicipal ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            Общински
          </button>

          <button
            onClick={onTogglePrivate}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #cbd5e1",
              background: showPrivate ? "#ef4444" : "#fff",
              color: showPrivate ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            Частни
          </button>
        </div>
      </div>

      <div
        style={{
          marginBottom: 18,
          padding: 14,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
          Легенда
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#2563eb",
                display: "inline-block",
              }}
            />
            <span>Зона</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#f59e0b",
                display: "inline-block",
              }}
            />
            <span>Общински паркинг</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: "#ef4444",
                display: "inline-block",
              }}
            />
            <span>Частен паркинг</span>
          </div>
        </div>
      </div>

      {nothingVisible && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 14px",
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fdba74",
            color: "#9a3412",
            fontSize: 14,
          }}
        >
          В момента всички слоеве са изключени. Включи поне един, за да видиш
          информация на картата.
        </div>
      )}

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: "#fff",
          border: "1px solid #e2e8f0",
          minHeight: 180,
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
          Избран обект
        </div>

        {!selectedItem ? (
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.5 }}>
            Избери зона или паркинг от картата, за да видиш детайли.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{ margin: "0 0 8px 0", fontSize: 22, lineHeight: 1.3 }}
                >
                  {selectedItem.name}
                </h3>

                <p style={{ margin: 0, color: "#475569" }}>
                  {selectedItem.kind === "zone"
                    ? zoneTypeLabel[selectedItem.zoneType] ||
                      selectedItem.zoneType
                    : parkingTypeLabel[selectedItem.parkingType] ||
                      selectedItem.parkingType}
                </p>
              </div>

              <button
                onClick={onClearSelected}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  borderRadius: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {selectedItem.kind === "zone" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>Цена</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.priceText || "-"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    SMS номер
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.smsNumber || "-"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Примерен SMS
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.smsTemplate || "-"}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>Цена</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.priceText || "-"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>Адрес</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.address || "-"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    Приблизителни места
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedItem.approxCapacity ?? "-"}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: "#fff",
          border: "1px solid #e2e8f0",
          marginBottom: 18,
        }}
      >
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
              const isSelected =
                selectedItem?.kind === "parking" && selectedItem.id === p.id;

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
                    transition: "all 0.15s ease",
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
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#475569",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        Съвет: по подразбиране паркингите се показват при по-голям zoom. Ако
        ръчно включиш общински или частни, ще ги виждаш веднага.
      </div>
    </aside>
  );
}
