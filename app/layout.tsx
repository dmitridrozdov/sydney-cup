import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sydney Cup 3.0 — Doubles Tennis Championship",
  description:
    "Sydney Cup 3.0 — The premier doubles tennis championship. August 2, 2026.",
  openGraph: {
    title: "Sydney Cup 3.0",
    description: "Doubles Tennis Championship — August 2, 2026",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
