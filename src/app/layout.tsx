import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeInit } from "@/components/shared/ThemeInit";

export const metadata: Metadata = {
  title: "Enfoque Diario",
  description: "Organiza tu rutina, mejora tu concentración y mantén una mentalidad positiva.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Enfoque Diario",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1117" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
