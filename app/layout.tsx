import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImagePet",
  icons: {
    icon: "/favicon.svg",
  },
  description: "Your images bouncing!",
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
