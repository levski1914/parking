// "use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PendingApprovalBanner } from "@/app/components/auth/pending-approval-banner";
import { AuthProvider } from "./context/AuthProvider";
import { AdminGuard } from "./components/auth/AdminGuard";
// import { ServiceWorkerRegister } from "./page";
// import { useEffect } from "react";
import { ServiceWorkerRegister } from "./components/pwa/ServiceWorkerRegister";
// import { AdminGuard } from "./components/auth/AdminGuard";
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
  themeColor: "#2563eb",
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
      <PendingApprovalBanner />
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
