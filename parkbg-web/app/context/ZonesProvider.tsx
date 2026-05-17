"use client";

import { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "@/app/context/LocationProvider";
import { useNotifications } from "@/app/context/NotificationsProvider";

type Zone = {
  id: string;
  name: string;
  zoneType: "BLUE" | "GREEN" | "PINK" | "OTHER";
  priceText: string;
  smsNumber?: string | null;
  polygonGeoJson: any;
};

function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: number[][],
) {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function getZoneLabel(zoneType: string) {
  if (zoneType === "BLUE") return "Синя зона";
  if (zoneType === "GREEN") return "Зелена зона";
  if (zoneType === "PINK") return "Розова зона";
  return "Зона";
}

export function ZoneTrackingProvider({ children }: { children: ReactNode }) {
  const { userLocation } = useLocation();
  const { notificationsEnabled, sendLocalNotification } = useNotifications();

  const [zones, setZones] = useState<Zone[]>([]);
  const lastNotificationRef = useRef<{ zoneId: string; time: number } | null>(
    null,
  );

  useEffect(() => {
    async function loadZones() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/zones/public/all`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) return;

      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    }

    loadZones();
  }, []);

  useEffect(() => {
    if (!userLocation || !notificationsEnabled || zones.length === 0) return;

    const foundZone = zones.find((zone) => {
      const polygon = zone.polygonGeoJson;
      if (!polygon?.coordinates?.[0]) return false;
      return isPointInPolygon(userLocation, polygon.coordinates[0]);
    });

    if (!foundZone) return;

    const now = Date.now();
    const last = lastNotificationRef.current;
    const cooldownMs = 10 * 60 * 1000;

    if (last?.zoneId === foundZone.id && now - last.time < cooldownMs) return;

    lastNotificationRef.current = {
      zoneId: foundZone.id,
      time: now,
    };

    sendLocalNotification(
      `${getZoneLabel(foundZone.zoneType)}: ${foundZone.name}`,
      {
        body: `${foundZone.priceText} • SMS: ${foundZone.smsNumber || "няма"}`,
        tag: `zone-${foundZone.id}`,
      },
    );
  }, [userLocation, zones, notificationsEnabled, sendLocalNotification]);

  return <>{children}</>;
}
