import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoSync | Taller Mecánico en Mar del Plata, Buenos Aires",
  description:
    "AutoSync: taller mecánico en Mar del Plata, Buenos Aires. Cambios de aceite, frenos, diagnóstico computarizado, suspensión, service programado y más. Registrá tu vehículo y llevá un historial completo de los trabajos realizados.",
  keywords: [
    "taller mecánico",
    "Mar del Plata",
    "AutoSync",
    "mecánica automotor",
    "cambio de aceite",
    "frenos",
    "diagnóstico computarizado",
    "service programado",
    "historial de servicio",
  ],
  authors: [{ name: "AutoSync" }],
  icons: {
    icon: "/favicon-autosync.png",
    apple: "/favicon-autosync.png",
  },
  openGraph: {
    title: "AutoSync | Taller Mecánico en Mar del Plata",
    description: "Servicio automotor integral en Mar del Plata, Buenos Aires.",
    siteName: "AutoSync",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
