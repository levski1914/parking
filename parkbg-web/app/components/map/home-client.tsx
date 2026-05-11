"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapSection } from "@/app/components/map/map-section";
import { Sidebar } from "@/app/components/map/sidebar";
import { Parking, SelectedItem, Zone } from "@/app/components/map/ParkingMap";
import { Navbar } from "../layout/navbar";
import { RightSidebar } from "@/app/components/map/right-sidebar";
import { ParkingReviews } from "@/app/components/map/ParkingReviews";
import { ReportButton } from "@/app/components/map/ReportButton";
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
  const [mobileTab, setMobileTab] = useState<
    "parkings" | "nearby" | "details" | "filters"
  >("parkings");
  const SHEET_MIN_VISIBLE = 86;
  const SHEET_MAX_VH = 0.86;

  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartTranslateRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
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
      phone: p.phone || "",
    });

    setFocusedParkingId(p.id);

    if (isMobile) {
      setMobileTab("details");
      openSheetHalf();
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 900);
    }

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  useEffect(() => {
    if (!isMobile) return;

    function updateSheetSize() {
      const h = window.innerHeight * SHEET_MAX_VH;
      setSheetHeight(h);
      setSheetTranslateY(h * 0.42);
    }

    updateSheetSize();
    window.addEventListener("resize", updateSheetSize);

    return () => window.removeEventListener("resize", updateSheetSize);
  }, [isMobile]);
  useEffect(() => {
    if (!isMobile || !selectedItem) return;

    setMobileTab("details");
    openSheetHalf();
  }, [selectedItem, isMobile]);
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
        phone: parking.phone || "",
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
  const cheapestNearMe = useMemo(() => {
    if (!userLocation) return [];

    return filteredParkings
      .map((p) => ({
        ...p,
        distance: distanceInKm(
          userLocation.lat,
          userLocation.lng,
          Number(p.latitude),
          Number(p.longitude),
        ),
        numericPrice: extractPrice(p.priceText),
      }))
      .filter((p) => p.distance <= radiusKm)
      .sort((a, b) => a.numericPrice - b.numericPrice)
      .slice(0, 5);
  }, [userLocation, filteredParkings, radiusKm]);
  function formatDisplayPrice(priceText: string) {
    const match = priceText.match(/[\d.,]+/);
    if (!match) return priceText || "Няма цена";

    const value = Number(match[0].replace(",", "."));
    if (!Number.isFinite(value)) return priceText;

    const lower = priceText.toLowerCase();

    if (
      lower.includes("euro") ||
      lower.includes("евро") ||
      lower.includes("€")
    ) {
      return `${value.toFixed(2)} евро / час`;
    }

    if (lower.includes("лв") || lower.includes("bgn")) {
      return `${value.toFixed(2)} лв / час`;
    }

    return `${value.toFixed(2)} евро / час`;
  }
  const mobileCheapestList = userLocation ? cheapestNearMe : cheapestNearby;
  function findMyLocation() {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Устройството не поддържа локация.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        setLocationMessage("Локацията е намерена.");
        setMobileTab("nearby");
        openSheetHalf();
      },
      () => {
        setLocationMessage("Не успяхме да вземем локацията.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  const nearbyToMe = useMemo(() => {
    if (!userLocation) return [];

    return filteredParkings
      .map((p) => ({
        ...p,
        distance: distanceInKm(
          userLocation.lat,
          userLocation.lng,
          Number(p.latitude),
          Number(p.longitude),
        ),
        numericPrice: extractPrice(p.priceText),
      }))
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.numericPrice - b.numericPrice;
      })
      .slice(0, 8);
  }, [userLocation, filteredParkings]);

  function getSelectedParkingCoords() {
    if (!selectedItem || selectedItem.kind !== "parking") return null;

    const parking = parkings.find((p) => p.id === selectedItem.id);
    if (!parking) return null;

    return {
      lat: Number(parking.latitude),
      lng: Number(parking.longitude),
    };
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function getMaxTranslate() {
    return Math.max(sheetHeight - SHEET_MIN_VISIBLE, 0);
  }

  function handleSheetPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    dragStartYRef.current = e.clientY;
    dragStartTranslateRef.current = sheetTranslateY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleSheetPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (dragStartYRef.current === null) return;

    const diff = e.clientY - dragStartYRef.current;
    const next = clamp(
      dragStartTranslateRef.current + diff,
      0,
      getMaxTranslate(),
    );

    setSheetTranslateY(next);
  }

  function handleSheetPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (dragStartYRef.current === null) return;

    dragStartYRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const max = getMaxTranslate();
    const current = sheetTranslateY;

    const full = 0;
    const half = max * 0.48;
    const collapsed = max;

    const nearest = [full, half, collapsed].reduce((best, point) => {
      return Math.abs(point - current) < Math.abs(best - current)
        ? point
        : best;
    }, half);

    setSheetTranslateY(nearest);
  }

  function openSheetHalf() {
    const max = getMaxTranslate();

    if (!max) return;

    setSheetTranslateY(max * 0.48);
  }
  function isSheetCollapsed() {
    const max = getMaxTranslate();
    return sheetTranslateY > max - 20;
  }

  function handleSheetHandleClick() {
    const max = getMaxTranslate();

    if (isSheetCollapsed()) {
      setSheetTranslateY(max * 0.48);
      return;
    }

    setSheetTranslateY(max);
  }

  function openSheetIfCollapsed() {
    if (isSheetCollapsed()) {
      openSheetHalf();
    }
  }

  function handleMobileTabClick(tabKey: typeof mobileTab) {
    setMobileTab(tabKey);

    const max = getMaxTranslate();
    if (!max) return;

    if (isSheetCollapsed()) {
      setSheetTranslateY(max * 0.48);
    }
  }
  return (
    <>
      <Navbar citySlug={city.slug} />

      <main
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: isMobile ? 10 : 24,
          paddingBottom: isMobile ? 220 : 24,
        }}
      >
        <div style={{ maxWidth: 1680, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "300px minmax(0, 1fr) 300px",
              gap: 16,
              alignItems: "start",
            }}
          >
            {!isMobile && (
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
            )}

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

              {!isMobile && (
                <div
                  style={{
                    marginTop: 12,
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
                            <span
                              style={{
                                color:
                                  index === 0
                                    ? "#16a34a"
                                    : index === 1
                                      ? "#2563eb"
                                      : "#f59e0b",
                                fontSize: 12,
                              }}
                            >
                              {index === 0
                                ? "Най-евтин"
                                : index === 1
                                  ? "Близо"
                                  : "Добър избор"}
                            </span>
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
                            {formatDisplayPrice(p.priceText)}
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
              )}
            </div>

            {!isMobile && (
              <RightSidebar
                visibleParkings={visibleParkings}
                availabilityNow={availabilityNow}
                selectedParkingId={
                  selectedItem?.kind === "parking" ? selectedItem.id : null
                }
                onSelectParkingFromList={handleSelectParking}
              />
            )}
          </div>
        </div>

        {isMobile && (
          <div
            ref={sheetRef}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 60,
              height: sheetHeight || "86vh",
              background: "#fff",
              borderTop: "1px solid #e2e8f0",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              overflow: "hidden",
              boxShadow: "0 -8px 30px rgba(15,23,42,0.12)",
              transform: `translateY(${sheetTranslateY}px)`,
              transition:
                dragStartYRef.current === null
                  ? "transform 0.22s ease"
                  : "none",
              willChange: "transform",
            }}
          >
            <button
              type="button"
              onClick={handleSheetHandleClick}
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={handleSheetPointerUp}
              style={{
                width: "100%",
                height: 32,
                border: "none",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "none",
                cursor: "grab",
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 999,
                  background: "#94a3b8",
                  display: "block",
                }}
              />
            </button>

            <div
              style={{
                padding: "0 12px 14px",
                overflowY: "auto",
                height: "calc(100% - 30px)",
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { key: "parkings", label: "Паркинги" },
                  { key: "nearby", label: "Близки" },
                  { key: "details", label: "Детайли" },
                  { key: "filters", label: "Филтри" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() =>
                      handleMobileTabClick(tab.key as typeof mobileTab)
                    }
                    style={{
                      flex: 1,
                      padding: "9px 6px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: mobileTab === tab.key ? "#2563eb" : "#fff",
                      color: mobileTab === tab.key ? "#fff" : "#0f172a",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {mobileTab === "parkings" && (
                <RightSidebar
                  visibleParkings={visibleParkings}
                  availabilityNow={availabilityNow}
                  selectedParkingId={
                    selectedItem?.kind === "parking" ? selectedItem.id : null
                  }
                  onSelectParkingFromList={handleSelectParking}
                />
              )}

              {mobileTab === "nearby" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    onClick={findMyLocation}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #2563eb",
                      background: "#2563eb",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    Намери около мен
                  </button>

                  {locationMessage && (
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {locationMessage}
                    </div>
                  )}

                  {!userLocation ? (
                    <p style={{ color: "#64748b", margin: 0 }}>
                      Натисни “Намери около мен”, за да видиш най-близките
                      паркинги.
                    </p>
                  ) : nearbyToMe.length === 0 ? (
                    <p style={{ color: "#64748b", margin: 0 }}>
                      Няма намерени паркинги около теб.
                    </p>
                  ) : (
                    nearbyToMe.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectParking(p)}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <strong>{p.name}</strong>
                        <div>{formatDisplayPrice(p.priceText)}</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          {p.distance.toFixed(1)} км •{" "}
                          {p.parkingType === "MUNICIPAL"
                            ? "Общински"
                            : "Частен"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {mobileTab === "details" && (
                <div style={{ display: "grid", gap: 10 }}>
                  {!selectedItem ? (
                    <p style={{ color: "#64748b", margin: 0 }}>
                      Избери зона или паркинг от картата.
                    </p>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>
                        {selectedItem.name}
                      </div>
                      {(() => {
                        const coords = getSelectedParkingCoords();

                        if (!coords) return null;

                        return (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: "#2563eb",
                              color: "#fff",
                              textDecoration: "none",
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            Навигирай
                          </a>
                        );
                      })()}
                      <div style={{ color: "#64748b", fontSize: 14 }}>
                        {formatDisplayPrice(selectedItem.priceText)}
                      </div>

                      {selectedItem.kind === "parking" && (
                        <>
                          <ParkingReviews parkingId={selectedItem.id} />
                          <div style={{ fontSize: 14 }}>
                            {selectedItem.address}
                          </div>

                          {selectedItem.phone && (
                            <a
                              href={`tel:${selectedItem.phone}`}
                              style={{
                                display: "inline-block",
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "#16a34a",
                                color: "#fff",
                                textDecoration: "none",
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                            >
                              Обади се
                            </a>
                          )}

                          <ReportButton
                            targetType={
                              selectedItem.kind === "parking"
                                ? "PARKING"
                                : "ZONE"
                            }
                            targetId={selectedItem.id}
                          />
                        </>
                      )}

                      {selectedItem.kind === "zone" && (
                        <>
                          <div>SMS номер: {selectedItem.smsNumber || "-"}</div>
                          <div>SMS: {selectedItem.smsTemplate || "-"}</div>

                          {selectedItem.smsNumber && (
                            <a
                              href={`sms:${selectedItem.smsNumber}`}
                              style={{
                                display: "inline-block",
                                padding: "10px 12px",
                                borderRadius: 10,
                                background: "#2563eb",
                                color: "#fff",
                                textDecoration: "none",
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                            >
                              Изпрати SMS
                            </a>
                          )}

                          <button
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: "1px solid #cbd5e1",
                              background: "#fff",
                              fontWeight: 600,
                            }}
                          >
                            Докладвай проблем
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {mobileTab === "filters" && (
                <div style={{ display: "grid", gap: 10 }}>
                  <button
                    onClick={() => setShowZones((v) => !v)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      border: "1px solid #cbd5e1",
                      background: showZones ? "#2563eb" : "#fff",
                      color: showZones ? "#fff" : "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {showZones ? "Скрий зони" : "Покажи зони"}
                  </button>

                  <button
                    onClick={() => {
                      setTouchedParking(true);
                      setShowMunicipal((v) => !v);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      border: "1px solid #cbd5e1",
                      background: showMunicipal ? "#2563eb" : "#fff",
                      color: showMunicipal ? "#fff" : "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {showMunicipal ? "Скрий общински" : "Покажи общински"}
                  </button>

                  <button
                    onClick={() => {
                      setTouchedParking(true);
                      setShowPrivate((v) => !v);
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      border: "1px solid #cbd5e1",
                      background: showPrivate ? "#2563eb" : "#fff",
                      color: showPrivate ? "#fff" : "#0f172a",
                      fontWeight: 600,
                    }}
                  >
                    {showPrivate ? "Скрий частни" : "Покажи частни"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
