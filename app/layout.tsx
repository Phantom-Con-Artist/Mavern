import type { Metadata, Viewport } from "next";
import { DM_Sans, Dela_Gothic_One } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Hairlines } from "@/components/layout/Hairlines";
import { Header } from "@/components/layout/Header";
import { VhsFilters } from "@/components/media/Vhs";
import { SoundStart } from "@/components/sound/SoundStart";
import "@/styles/globals.css";

const dela = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-dela", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mavern.in"),
  title: { default: "Mavern", template: "%s · Mavern" },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/favicon-32.png", type: "image/png", sizes: "32x32" }], apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#1c0f2e" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dela.variable} ${dm.variable}`}>
      <body>
        <VhsFilters />
        <Header />
        <Hairlines />
        {children}
        <Footer />
        <SoundStart />
      </body>
    </html>
  );
}
