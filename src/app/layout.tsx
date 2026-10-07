import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "BIO QUEST — ผจญภัยชีววิทยา 8-Bit",
  description: "เกมเรียนชีววิทยา ม.ปลาย (สสวท.) สไตล์เกมคอนโซลยุค 8-bit",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        {/* ฟอนต์พิกเซล + ฟอนต์ไทย และ NES.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Prompt:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" rel="stylesheet" />
      </head>
      <body className="crt antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
