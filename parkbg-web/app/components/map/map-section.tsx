"use client";

import { Parking, SelectedItem, VarnaMap, Zone } from "./varna-map";

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type MapSectionProps = {
  zones: Zone[];
  parkings: Parking[];
  selectedItem: SelectedItem | null;
  setSelectedItem: (item: SelectedItem | null) => void;
  forceShowParkings: boolean;
  onBoundsChange: (bounds: Bounds) => void;
  focusedParkingId: string | null;
};

export function MapSection({
  zones,
  parkings,
  selectedItem,
  setSelectedItem,
  forceShowParkings,
  onBoundsChange,
  focusedParkingId,
}: MapSectionProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "16px",
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
        selectedItem={selectedItem}
      />
    </div>
  );
}
