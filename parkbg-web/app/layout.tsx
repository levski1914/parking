// "use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PendingApprovalBanner } from "@/app/components/auth/pending-approval-banner";
import { AuthProvider } from "./context/AuthProvider";

import { ServiceWorkerRegister } from "./components/pwa/ServiceWorkerRegister";
import { LocationProvider } from "./context/LocationProvider";
import { NotificationProvider } from "./context/NotificationsProvider";
import { ZoneTrackingProvider } from "./context/ZonesProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ParkBG",
  description: "Паркинги, зони и информация за паркиране в България.",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "ParkBG",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ParkBG" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <PendingApprovalBanner />
        <AuthProvider>
          <LocationProvider>
            <NotificationProvider>
              <ZoneTrackingProvider>{children}</ZoneTrackingProvider>
            </NotificationProvider>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
