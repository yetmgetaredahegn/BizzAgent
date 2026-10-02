import type { Metadata, Viewport } from "next";
import { Fraunces, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";

import { LanguageSync } from "@/components/language";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const ethiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-ethiopic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FundFlow · From a voice note to a fundable proposal",
    template: "%s · FundFlow",
  },
  description:
    "FundFlow turns a spoken story, phone photos and a paper licence into a complete, honest funding application, and gives reviewers a ranked shortlist they can defend. Built for sequa gGmbH.",
  applicationName: "FundFlow",
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} ${ethiopic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageSync />
        {children}
      </body>
    </html>
  );
}
