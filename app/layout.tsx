import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Sydney Cup 3.0 — Doubles Tennis Championship",
  description:
    "Sydney Cup 3.0 — The premier doubles tennis championship. August 2, 2026.",
  openGraph: {
    title: "Sydney Cup 3.0",
    description: "Doubles Tennis Championship — August 2, 2026",
    type: "website",
  },
  icons: {
    icon: '/sydney_cup_icon.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
