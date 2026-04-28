"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapSection } from "@/app/components/map/map-section";
import { Sidebar } from "@/app/components/map/sidebar";
import { Parking, SelectedItem, Zone } from "@/app/components/map/ParkingMap";
import { Navbar } from "../layout/navbar";
import { RightSidebar } from "@/app/components/map/right-sidebar";
type HomeClientProps = {
  city: {
    id: string;
    name: string;
    slug: string;
    centerLat: number;
    centerLng: number;
    defaultZoom: number;
  };
  zones: Zone[];
  parkings: Parking[];
};
type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};
type CheapestParking = Parking & {
  distance: number;
  numericPrice: number;
};
function distanceInKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function extractPrice(priceText: string) {
  const match = priceText.match(/[\d.]+/);
  return match ? Number(match[0]) : Infinity;
}

export function HomeClient({ city, zones, parkings }: HomeClientProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showMunicipal, setShowMunicipal] = useState(true);
  const [showPrivate, setShowPrivate] = useState(false);
  const [touchedParking, setTouchedParking] = useState(false);
  const [radiusKm, setRadiusKm] = useState(2);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [focusedParkingId, setFocusedParkingId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const [cheapestNearby, setCheapestNearby] = useState<CheapestParking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const filteredZones = useMemo(() => {
    return showZones ? zones : [];
  }, [showZones, zones]);
  const handleSelectParking = (p: Parking) => {
    setSelectedItem({
      kind: "parking",
      id: p.id,
      name: p.name,
      parkingType: p.parkingType,
      address: p.address,
      priceText: p.priceText,
      approxCapacity: p.approxCapacity,
    });

    setFocusedParkingId(p.id);
  };
  function getAvailabilityLabel(capacity?: number | null) {
    if (!capacity || capacity <= 20) return "Ограничени места";
    if (capacity <= 80) return "Вероятно има места";
    return "По-голям шанс за свободни места";
  }

  function findCheapestNearby() {
    if (!bounds) return;

    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;

    const nearby = filteredParkings
      .map((p) => ({
        ...p,
        distance: distanceInKm(
          centerLat,
          centerLng,
          Number(p.latitude),
          Number(p.longitude),
        ),
        numericPrice: extractPrice(p.priceText),
      }))
      .filter((p) => p.distance <= radiusKm)
      .sort((a, b) => a.numericPrice - b.numericPrice)
      .slice(0, 3);

    setCheapestNearby(nearby);
  }
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return [];

    const parkingResults = parkings
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
        );
      })
      .map((p) => ({
        id: p.id,
        kind: "parking" as const,
        title: p.name,
        subtitle: p.address,
      }));

    const zoneResults = zones
      .filter((z) => {
        return z.name.toLowerCase().includes(q);
      })
      .map((z) => ({
        id: z.id,
        kind: "zone" as const,
        title: z.name,
        subtitle: z.priceText,
      }));

    return [...parkingResults, ...zoneResults].slice(0, 8);
  }, [searchQuery, parkings, zones]);

  const handleSearchSelect = (result: {
    id: string;
    kind: "parking" | "zone";
  }) => {
    if (result.kind === "parking") {
      const parking = parkings.find((p) => p.id === result.id);
      if (!parking) return;

      setSelectedItem({
        kind: "parking",
        id: parking.id,
        name: parking.name,
        parkingType: parking.parkingType,
        address: parking.address,
        priceText: parking.priceText,
        approxCapacity: parking.approxCapacity,
      });

      setFocusedZoneId(null);
      setFocusedParkingId(parking.id);
      setSearchQuery("");
      return;
    }

    const zone = zones.find((z) => z.id === result.id);
    if (!zone) return;

    setSelectedItem({
      kind: "zone",
      id: zone.id,
      name: zone.name,
      zoneType: zone.zoneType,
      priceText: zone.priceText,
      smsNumber: zone.smsNumber || "",
      smsTemplate: zone.smsTemplate || "",
    });

    setFocusedParkingId(null);
    setFocusedZoneId(zone.id);
    setSearchQuery("");
  };
  const filteredParkings = useMemo(() => {
    return parkings.filter((p) => {
      if (p.parkingType === "MUNICIPAL" && showMunicipal) return true;
      if (p.parkingType === "PRIVATE" && showPrivate) return true;
      return false;
    });
  }, [parkings, showMunicipal, showPrivate]);
  useEffect(() => {
    if (!bounds) return;
    findCheapestNearby();
  }, [bounds, filteredParkings, radiusKm]);
  const nothingVisible = !showZones && !showMunicipal && !showPrivate;
  const forceShowParkings = touchedParking && (showMunicipal || showPrivate);
  function isInsideBounds(p: Parking, b: Bounds) {
    const lat = Number(p.latitude);
    const lng = Number(p.longitude);

    return lat <= b.north && lat >= b.south && lng <= b.east && lng >= b.west;
  }

  const visibleParkings = useMemo(() => {
    if (!bounds) return [];

    return filteredParkings.filter((p) => isInsideBounds(p, bounds));
  }, [filteredParkings, bounds]);
  const availabilityNow = useMemo(() => {
    return visibleParkings.slice(0, 4).map((p) => ({
      ...p,
      availabilityLabel: getAvailabilityLabel(p.approxCapacity),
    }));
  }, [visibleParkings]);
  return (
    <>
      <Navbar citySlug={city.slug} />

      <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
        <div style={{ maxWidth: 1680, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "300px minmax(0, 1fr) 300px",
              gap: 16,
              alignItems: "start",
            }}
          >
            <Sidebar
              selectedItem={selectedItem}
              showZones={showZones}
              showMunicipal={showMunicipal}
              showPrivate={showPrivate}
              nothingVisible={nothingVisible}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchResults={searchResults}
              onSearchSelect={handleSearchSelect}
              onToggleZones={() => setShowZones((v) => !v)}
              onFindCheapestNearby={findCheapestNearby}
              cheapestNearby={cheapestNearby}
              onToggleMunicipal={() => {
                setTouchedParking(true);
                setShowMunicipal((v) => !v);
              }}
              onTogglePrivate={() => {
                setTouchedParking(true);
                setShowPrivate((v) => !v);
              }}
              onClearSelected={() => setSelectedItem(null)}
            />
            <div>
              <MapSection
                city={city}
                zones={filteredZones}
                parkings={filteredParkings}
                onFocusedParkingHandled={() => setFocusedParkingId(null)}
                onBoundsChange={setBounds}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                forceShowParkings={forceShowParkings}
                focusedParkingId={focusedParkingId}
                focusedZoneId={focusedZoneId}
                onFocusedZoneHandled={() => setFocusedZoneId(null)}
              />
              <div
                style={{
                  marginBottom: 12,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      Най-евтини наблизо
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>
                      Спрямо текущия изглед на картата
                    </div>
                  </div>

                  <select
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                    }}
                  >
                    <option value={1}>В радиус 1 км</option>
                    <option value={2}>В радиус 2 км</option>
                    <option value={5}>В радиус 5 км</option>
                  </select>
                </div>

                {cheapestNearby.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    Няма намерени паркинги в избрания радиус.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {cheapestNearby.map((p, index) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectParking(p)}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ marginBottom: 6 }}>
                          {index === 0 && (
                            <span style={{ color: "#16a34a", fontSize: 12 }}>
                              Най-евтин
                            </span>
                          )}
                          {index === 1 && (
                            <span style={{ color: "#2563eb", fontSize: 12 }}>
                              Близо
                            </span>
                          )}
                          {index === 2 && (
                            <span style={{ color: "#f59e0b", fontSize: 12 }}>
                              Добър избор
                            </span>
                          )}
                        </div>

                        <div style={{ fontWeight: 700, lineHeight: 1.4 }}>
                          {p.name}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            color: "#0f172a",
                            marginTop: 6,
                          }}
                        >
                          {p.priceText}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748b",
                            marginTop: 4,
                          }}
                        >
                          {p.distance.toFixed(1)} км •{" "}
                          {p.parkingType === "MUNICIPAL"
                            ? "Общински"
                            : "Частен"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <RightSidebar
              visibleParkings={visibleParkings}
              availabilityNow={availabilityNow}
              selectedParkingId={
                selectedItem?.kind === "parking" ? selectedItem.id : null
              }
              onSelectParkingFromList={handleSelectParking}
            />
          </div>
        </div>
      </main>
    </>
  );
}
