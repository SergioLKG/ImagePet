import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import App from "../src/App";

export const metadata: Metadata = {
  title: "ImagePet",
  icons: {
    icon: "/favicon.svg",
  },
  description: "Your images bouncing!",
  openGraph: {
    title: "ImagePet",
    description: "Your images bouncing!",
    url: "https://imagepet.vercel.app",
    siteName: "ImagePet",
    images: [
      {
        url: "https://imagepet.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es-ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
