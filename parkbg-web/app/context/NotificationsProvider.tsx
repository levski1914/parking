"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SendNotificationOptions = {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
};

type NotificationContextType = {
  permission: NotificationPermission | "unsupported";
  notificationsEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (
    title: string,
    options?: SendNotificationOptions,
  ) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  permission: "default",
  notificationsEnabled: false,
  requestPermission: async () => false,
  sendLocalNotification: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    return result === "granted";
  }

  async function sendLocalNotification(
    title: string,
    options?: SendNotificationOptions,
  ) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
          body: options?.body,
          icon: options?.icon || "/icons/icon-192.png",
          badge: options?.badge || "/icons/icon-192.png",
          tag: options?.tag,
        });

        return;
      }

      new Notification(title, {
        body: options?.body,
        icon: options?.icon || "/icons/icon-192.png",
        tag: options?.tag,
      });
    } catch (err) {
      console.error("Notification error:", err);
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        permission,
        notificationsEnabled: permission === "granted",
        requestPermission,
        sendLocalNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
