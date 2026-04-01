import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "messier systems",
  description: "mara messier's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="p-0 m-0">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable} antialiased p-0 m-0`}
      >
        {children}
      </body>
    </html>
  );
}
