import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import CyberGrid from "@/components/effects/CyberGrid";
import CursorScanner from "@/components/effects/CursorScanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "QuickOCR // Cyber Neural OCR Engine",
  description:
    "AI-powered text extraction from images. Fast, local, private, and powered by EasyOCR and OpenCV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-[#080B0A] text-[#F5F7F5] min-h-screen relative selection:bg-[#39FF14]/20 selection:text-[#39FF14]`}
      >
        <ReduxProvider>
          <CyberGrid />
          <CursorScanner />
          <div className="relative z-10">{children}</div>
        </ReduxProvider>
      </body>
    </html>
  );
}
