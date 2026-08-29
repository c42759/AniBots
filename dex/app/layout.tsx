import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniDex - AniBots & Anima Chips Tactical Databank",
  description: "Pokédex-style tactical database for browsing AniBots robot frames and Anima Chips AI cores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
