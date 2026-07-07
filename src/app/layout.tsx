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
  title: "Taller Mecánica Mar del Plata | Servicio Automotor Integral",
  description:
    "Taller mecánico en Mar del Plata, Buenos Aires. Cambios de aceite, frenos, diagnóstico computarizado, suspensión, service programado y más. Registrá tu vehículo y llevá un historial completo de los trabajos realizados.",
  keywords: [
    "taller mecánico",
    "Mar del Plata",
    "mecánica automotor",
    "cambio de aceite",
    "frenos",
    "diagnóstico computarizado",
    "service programado",
    "historial de servicio",
  ],
  authors: [{ name: "Taller Mecánica MDP" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Taller Mecánica Mar del Plata",
    description: "Servicio automotor integral en Mar del Plata, Buenos Aires.",
    siteName: "Taller Mecánica MDP",
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
