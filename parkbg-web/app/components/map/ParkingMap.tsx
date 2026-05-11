"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export type Zone = {
  id: string;
  name: string;
  zoneType: "BLUE" | "GREEN" | "PINK" | "OTHER";
  priceText: string;
  smsNumber?: string | null;
  smsTemplate?: string | null;
  polygonGeoJson: GeoJSON.GeoJSON;
};

export type Parking = {
  id: string;
  name: string;
  parkingType: "PRIVATE" | "MUNICIPAL";
  address: string;
  latitude: number | string;
  longitude: number | string;
  priceText: string;
  approxCapacity?: number | null;
  phone?: string | null;
};

export type SelectedItem =
  | {
      kind: "zone";
      id: string;
      name: string;
      zoneType: string;
      priceText: string;
      smsNumber?: string;
      smsTemplate?: string;
    }
  | {
      kind: "parking";
      id: string;
      name: string;
      parkingType: string;
      address: string;
      priceText: string;
      approxCapacity?: number | null;
      phone?: string | null;
    };
export type UserLocation = {
  lat: number;
  lng: number;
};
type VarnaMapProps = {
  zones: Zone[];
  parkings: Parking[];
  onSelectItem: (item: SelectedItem | null) => void;
  forceShowParkings?: boolean;
  onBoundsChange?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  initialCenter: [number, number];
  userLocation?: UserLocation | null;
  initialZoom?: number;
  focusedParkingId?: string | null;
  selectedItem?: SelectedItem | null;
  onFocusedParkingHandled?: () => void;
};

function getZonesGeoJson(zones: Zone[]) {
  return {
    type: "FeatureCollection" as const,
    features: zones.map((z) => ({
      type: "Feature" as const,
      geometry: z.polygonGeoJson as GeoJSON.Geometry,
      properties: {
        id: z.id,
        name: z.name,
        zoneType: z.zoneType,
        priceText: z.priceText,
        smsNumber: z.smsNumber || "",
        smsTemplate: z.smsTemplate || "",
      },
    })),
  };
}
function formatShortPrice(priceText: string) {
  const match = priceText.match(/[\d.]+/);
  if (!match) return "--";

  const value = Number(match[0]);

  if (!Number.isFinite(value)) return "--";

  if (priceText.toLowerCase().includes("euro") || priceText.includes("€")) {
    return `€${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
  }

  if (priceText.toLowerCase().includes("лв")) {
    return `${value.toFixed(value % 1 === 0 ? 0 : 2)} лв`;
  }

  return `${value}`;
}
function getParkingsGeoJson(parkings: Parking[]) {
  return {
    type: "FeatureCollection" as const,
    features: parkings.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [Number(p.longitude), Number(p.latitude)],
      },
      properties: {
        id: p.id,
        name: p.name,
        parkingType: p.parkingType,
        address: p.address,
        priceText: p.priceText,
        shortPrice: formatShortPrice(p.priceText),
        phone: p.phone || "",
        approxCapacity: p.approxCapacity ?? "",
      },
    })),
  };
}
function getSelectedParkingGeoJson(
  parkings: Parking[],
  selectedItem: SelectedItem | null | undefined,
) {
  if (!selectedItem || selectedItem.kind !== "parking") {
    return {
      type: "FeatureCollection" as const,
      features: [],
    };
  }

  const parking = parkings.find((p) => p.id === selectedItem.id);

  if (!parking) {
    return {
      type: "FeatureCollection" as const,
      features: [],
    };
  }

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [Number(parking.longitude), Number(parking.latitude)],
        },
        properties: {
          id: parking.id,
          parkingType: parking.parkingType,
        },
      },
    ],
  };
}

function getUserLocationGeoJson(userLocation?: UserLocation | null) {
  if (!userLocation) {
    return {
      type: "FeatureCollection" as const,
      features: [],
    };
  }

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [userLocation.lng, userLocation.lat],
        },
        properties: {},
      },
    ],
  };
}
export function VarnaMap({
  zones,
  parkings,
  onSelectItem,
  forceShowParkings = false,
  initialCenter,
  initialZoom,
  userLocation,
  onBoundsChange,
  focusedParkingId,
  selectedItem,
  onFocusedParkingHandled,
}: VarnaMapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // create map once
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: ref.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: initialZoom || 13,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      const emitBounds = () => {
        if (!onBoundsChange) return;

        const b = map.getBounds();
        if (!b) return;

        onBoundsChange({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        });
      };

      map.on("moveend", emitBounds);
      map.on("zoomend", emitBounds);

      // първоначално
      emitBounds();
      map.addSource("zones", {
        type: "geojson",
        data: getZonesGeoJson(zones),
      });

      map.addLayer({
        id: "zones-fill",
        type: "fill",
        source: "zones",
        paint: {
          "fill-color": [
            "match",
            ["get", "zoneType"],
            "BLUE",
            "#3b82f6",
            "GREEN",
            "#22c55e",
            "PINK",
            "#ec4899",
            "#6b7280",
          ],
          "fill-opacity": 0.18,
        },
      });

      map.addLayer({
        id: "zones-outline",
        type: "line",
        source: "zones",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
        },
      });

      map.addSource("parkings", {
        type: "geojson",
        data: getParkingsGeoJson(parkings),
      });

      map.addLayer({
        id: "parkings-layer",
        type: "circle",
        source: "parkings",
        paint: {
          "circle-radius": 9,
          "circle-color": [
            "match",
            ["get", "parkingType"],
            "MUNICIPAL",
            "#f59e0b",
            "PRIVATE",
            "#ef4444",
            "#6b7280",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
          "circle-opacity": 1,
        },
      });
      map.addLayer({
        id: "parkings-price-label",
        type: "symbol",
        source: "parkings",
        layout: {
          "text-field": ["get", "shortPrice"],
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-offset": [0, -1.6],
          "text-anchor": "bottom",
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": [
            "match",
            ["get", "parkingType"],
            "MUNICIPAL",
            "#f59e0b",
            "PRIVATE",
            "#ef4444",
            "#2563eb",
          ],
          "text-halo-width": 8,
        },
      });
      if (!map.getSource("selected-parking")) {
        map.addSource("selected-parking", {
          type: "geojson",
          data: getSelectedParkingGeoJson(parkings, selectedItem),
        });
      }

      if (!map.getLayer("selected-parking-ring")) {
        map.addLayer({
          id: "selected-parking-ring",
          type: "circle",
          source: "selected-parking",
          paint: {
            "circle-radius": 18,
            "circle-color": "#2563eb",
            "circle-opacity": 0.18,
          },
        });
      }

      if (!map.getLayer("selected-parking-dot")) {
        map.addLayer({
          id: "selected-parking-dot",
          type: "circle",
          source: "selected-parking",
          paint: {
            "circle-radius": 11,
            "circle-color": [
              "match",
              ["get", "parkingType"],
              "MUNICIPAL",
              "#f59e0b",
              "PRIVATE",
              "#ef4444",
              "#6b7280",
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });
      }
      if (!map.getSource("user-location")) {
        map.addSource("user-location", {
          type: "geojson",
          data: getUserLocationGeoJson(userLocation),
        });
      }

      if (!map.getLayer("user-location-accuracy")) {
        map.addLayer({
          id: "user-location-accuracy",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 24,
            "circle-color": "#2563eb",
            "circle-opacity": 0.14,
          },
        });
      }

      if (!map.getLayer("user-location-dot")) {
        map.addLayer({
          id: "user-location-dot",
          type: "circle",
          source: "user-location",
          paint: {
            "circle-radius": 8,
            "circle-color": "#2563eb",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      map.on("click", "zones-fill", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        onSelectItem({
          kind: "zone",
          id: String(f.properties?.id || ""),
          name: String(f.properties?.name || ""),
          zoneType: String(f.properties?.zoneType || ""),
          priceText: String(f.properties?.priceText || ""),
          smsNumber: String(f.properties?.smsNumber || ""),
          smsTemplate: String(f.properties?.smsTemplate || ""),
        });
      });

      map.on("click", "parkings-layer", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        onSelectItem({
          kind: "parking",
          id: String(f.properties?.id || ""),
          name: String(f.properties?.name || ""),
          parkingType: String(f.properties?.parkingType || ""),
          address: String(f.properties?.address || ""),
          priceText: String(f.properties?.priceText || ""),
          approxCapacity: f.properties?.approxCapacity
            ? Number(f.properties.approxCapacity)
            : null,
          phone: String(f.properties?.phone || ""),
        });
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["zones-fill", "parkings-layer", "parkings-price-label"],
        });

        if (!features.length) {
          onSelectItem(null);
        }
      });
      map.on("click", "parkings-price-label", (e) => {
        const f = e.features?.[0];
        if (!f) return;

        onSelectItem({
          kind: "parking",
          id: String(f.properties?.id || ""),
          name: String(f.properties?.name || ""),
          parkingType: String(f.properties?.parkingType || ""),
          address: String(f.properties?.address || ""),
          priceText: String(f.properties?.priceText || ""),
          approxCapacity: f.properties?.approxCapacity
            ? Number(f.properties.approxCapacity)
            : null,
          phone: String(f.properties?.phone || ""),
        });
      });
      map.on("mouseenter", "zones-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "zones-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "parkings-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "parkings-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectItem, parkings, zones]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("user-location") as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (source) {
      source.setData(getUserLocationGeoJson(userLocation));
    }

    if (userLocation) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 900,
      });
    }
  }, [userLocation]);
  // update sources + zoom behavior when data/filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const zonesSource = map.getSource("zones") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (zonesSource) {
      zonesSource.setData(getZonesGeoJson(zones));
    }

    const parkingsSource = map.getSource("parkings") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (parkingsSource) {
      parkingsSource.setData(getParkingsGeoJson(parkings));
    }
    if (map.getLayer("parkings-price-label")) {
      if (forceShowParkings) {
        map.setLayerZoomRange("parkings-price-label", 0, 24);
      } else {
        map.setLayerZoomRange("parkings-price-label", 14, 24);
      }
    }
    if (map.getLayer("parkings-layer")) {
      if (forceShowParkings) {
        map.setLayerZoomRange("parkings-layer", 0, 24);
      } else {
        map.setLayerZoomRange("parkings-layer", 14, 24);
      }
    }
  }, [zones, parkings, forceShowParkings]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const selectedParkingSource = map.getSource("selected-parking") as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (selectedParkingSource) {
      selectedParkingSource.setData(
        getSelectedParkingGeoJson(parkings, selectedItem),
      );
    }
  }, [parkings, selectedItem]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusedParkingId) return;

    const parking = parkings.find((p) => p.id === focusedParkingId);
    if (!parking) return;

    map.flyTo({
      center: [Number(parking.longitude), Number(parking.latitude)],
      zoom: 16,
      duration: 1200,
    });

    onFocusedParkingHandled?.();
  }, [focusedParkingId, parkings, onFocusedParkingHandled]);
  return (
    <div
      ref={ref}
      style={{
        height: "calc(100vh - 190px)",
        minHeight: 520,
        borderRadius: 16,
      }}
    />
  );
}
