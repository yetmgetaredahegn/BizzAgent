import type { Metadata, Viewport } from "next";
import {
  Atkinson_Hyperlegible_Mono,
  Atkinson_Hyperlegible_Next,
  Familjen_Grotesk,
  Noto_Sans_Ethiopic,
  Noto_Serif_Ethiopic,
} from "next/font/google";

import { LogoDefs } from "@/components/ds/logo";
import { LanguageSync } from "@/components/language";
import { ThemeSync } from "@/components/theme";

import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

const atkinsonMono = Atkinson_Hyperlegible_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-atkinson-mono",
  display: "swap",
});

const familjen = Familjen_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-familjen",
  display: "swap",
});

const ethiopicSans = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

const ethiopicSerif = Noto_Serif_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["600", "700"],
  variable: "--font-noto-serif-ethiopic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BizzAgent · ቢዝኤጀንት",
    template: "%s · BizzAgent",
  },
  description:
    "A voice-first business agent for Ethiopia, in Amharic, Afaan Oromo and English. Every number and claim shows where it came from.",
  applicationName: "BizzAgent",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F4F8" },
    { media: "(prefers-color-scheme: dark)", color: "#111219" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [
    atkinson.variable,
    atkinsonMono.variable,
    familjen.variable,
    ethiopicSans.variable,
    ethiopicSerif.variable,
  ].join(" ");
  return (
    <html lang="en" className={`${fonts} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <LogoDefs />
        <LanguageSync />
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
