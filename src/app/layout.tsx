import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gradient Wallpapers Studio",
    template: "%s · Gradient Wallpapers",
  },
  description:
    "Design cinematic mesh, linear, and radial wallpapers with live preview and high-resolution export, powered by Kibo UI.",
  metadataBase: new URL("https://gradient-wallpapers.dev"),
  openGraph: {
    title: "Gradient Wallpapers Studio",
    description:
      "Craft polished mesh, linear, and radial wallpapers with precision controls and instant 5K export.",
    url: "https://gradient-wallpapers.dev",
    siteName: "Gradient Wallpapers Studio",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        width: 1600,
        height: 900,
        alt: "Gradient Wallpapers Studio preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradient Wallpapers Studio",
    description:
      "Generate cinematic gradients, preview in real-time, and export 5K wallpapers effortlessly.",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitScript = `
    (function () {
      var storageKey = "theme";
      try {
        var saved = localStorage.getItem(storageKey);
        var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var resolved = "dark";
        if (saved === "light" || saved === "dark") {
          resolved = saved;
        } else if (saved === "system") {
          resolved = prefersLight ? "light" : "dark";
        } else {
          resolved = prefersLight ? "light" : "dark";
        }
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.style.setProperty("color-scheme", resolved);
      } catch (e) {
        var fallbackLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var fallback = fallbackLight ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", fallback);
        document.documentElement.style.setProperty("color-scheme", fallback);
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
