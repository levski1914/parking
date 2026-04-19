"use client";

import { useMemo, useRef, useState } from "react";
import { MapSection } from "@/app/components/map/map-section";
import { Sidebar } from "@/app/components/map/sidebar";
import { Parking, SelectedItem, Zone } from "@/app/components/map/varna-map";

type HomeClientProps = {
  zones: Zone[];
  parkings: Parking[];
};
type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function HomeClient({ zones, parkings }: HomeClientProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showMunicipal, setShowMunicipal] = useState(true);
  const [showPrivate, setShowPrivate] = useState(false);
  const [touchedParking, setTouchedParking] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [focusedParkingId, setFocusedParkingId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

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
  const filteredParkings = useMemo(() => {
    return parkings.filter((p) => {
      if (p.parkingType === "MUNICIPAL" && showMunicipal) return true;
      if (p.parkingType === "PRIVATE" && showPrivate) return true;
      return false;
    });
  }, [parkings, showMunicipal, showPrivate]);

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

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", padding: 24 }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
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
            onToggleZones={() => setShowZones((v) => !v)}
            visibleParkings={visibleParkings}
            onSelectParkingFromList={handleSelectParking}
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

          <MapSection
            zones={filteredZones}
            parkings={filteredParkings}
            onBoundsChange={setBounds}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            forceShowParkings={forceShowParkings}
            focusedParkingId={focusedParkingId}
          />
        </div>
      </div>
    </main>
  );
}
