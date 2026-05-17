"use client";

import { Parking, SelectedItem, VarnaMap, Zone } from "./ParkingMap";

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type MapSectionProps = {
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
  selectedItem: SelectedItem | null;
  onMapClick?: () => void;
  setSelectedItem: (item: SelectedItem | null) => void;
  forceShowParkings: boolean;
  onBoundsChange: (bounds: Bounds) => void;
  onFocusedParkingHandled: () => void;
  focusedParkingId: string | null;
  focusedZoneId: string | null;
  onFocusedZoneHandled: () => void;
  userLocation?: {
    lat: number;
    lng: number;
  } | null;
};

export function MapSection({
  city,
  zones,
  parkings,
  selectedItem,
  setSelectedItem,
  forceShowParkings,
  userLocation,
  onBoundsChange,
  onMapClick,
  onFocusedParkingHandled,
  focusedParkingId,
}: MapSectionProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "8px",
        overflow: "hidden",
      }}
    >
      <VarnaMap
        zones={zones}
        parkings={parkings}
        onSelectItem={setSelectedItem}
        forceShowParkings={forceShowParkings}
        onBoundsChange={onBoundsChange}
        focusedParkingId={focusedParkingId}
        userLocation={userLocation}
        onMapClick={onMapClick}
        selectedItem={selectedItem}
        initialCenter={[city.centerLng, city.centerLat]}
        initialZoom={city.defaultZoom}
        onFocusedParkingHandled={onFocusedParkingHandled}
      />
    </div>
  );
}
