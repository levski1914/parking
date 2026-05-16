"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

type UserLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
};

type LocationContextType = {
  userLocation: UserLocation | null;
  locationMessage: string;
  isTracking: boolean;
  startTrackingLocation: () => void;
  stopTrackingLocation: () => void;
};

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  locationMessage: "",
  isTracking: false,
  startTrackingLocation: () => {},
  stopTrackingLocation: () => {},
});

const STORAGE_KEY = "parkbg_user_location";
// const TRACKING_KEY = "parkbg_location_tracking_enabled";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  function saveLocation(location: UserLocation) {
    setUserLocation(location);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }

  function startTrackingLocation() {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Устройството не поддържа локация.");
      return;
    }

    setIsTracking(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });

        setLocationMessage("Локацията е намерена.");
        setIsTracking(false);
      },
      (error) => {
        console.error("LOCATION ERROR:", error);
        setLocationMessage("Не успяхме да вземем локацията.");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 60000,
        timeout: 15000,
      },
    );
  }

  function stopTrackingLocation() {
    // localStorage.removeItem(TRACKING_KEY);
    setIsTracking(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setUserLocation(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsTracking(false);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        locationMessage,
        isTracking,
        startTrackingLocation,
        stopTrackingLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
