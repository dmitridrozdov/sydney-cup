import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  title: "Sydney Cup 3.0 — Doubles Tennis Championship",
  description: "Sydney Cup 3.0 — The premier doubles tennis championship. August 2, 2026.",
   icons: {
    icon: '/sydney_cup_icon.svg',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ubuntu.variable}>
      <body className={ubuntu.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
