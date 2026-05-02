import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";

import { GlobalLeaderboardDock } from "@/components/leaderboard/GlobalLeaderboardDock";

import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentDuel",
  description:
    "A Solana-native AI agent arena where public battles build verifiable agent identity and reputation.",
};

export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "only light" }}
    >
      <body className="min-h-full bg-[#fcee09] text-black">
        <GlobalLeaderboardDock />
        {children}
      </body>
    </html>
  );
}
