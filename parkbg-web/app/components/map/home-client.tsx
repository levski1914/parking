"use client";

import { useMemo, useRef, useState } from "react";
import { MapSection } from "@/app/components/map/map-section";
import { Sidebar } from "@/app/components/map/sidebar";
import { Parking, SelectedItem, Zone } from "@/app/components/map/ParkingMap";
import { Navbar } from "../layout/navbar";

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

export function HomeClient({ city, zones, parkings }: HomeClientProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showZones, setShowZones] = useState(true);
  const [showMunicipal, setShowMunicipal] = useState(true);
  const [showPrivate, setShowPrivate] = useState(false);
  const [touchedParking, setTouchedParking] = useState(false);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [focusedParkingId, setFocusedParkingId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
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
    <>
      <Navbar citySlug={city.slug} />

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
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              searchResults={searchResults}
              onSearchSelect={handleSearchSelect}
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
          </div>
        </div>
      </main>
    </>
  );
}
