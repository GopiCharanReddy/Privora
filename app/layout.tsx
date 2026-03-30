import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Privora — Private Ephemeral Chat",
  description:
    "Create private, ephemeral chat rooms that vanish once everyone leaves. No accounts, no history, just secure conversations.",
  keywords: ["private chat", "ephemeral", "secure", "anonymous", "real-time"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <body
        className={cn(
          "antialiased min-h-screen bg-background text-foreground",
          inter.variable,
          jetbrainsMono.variable,
          "font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
