import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { PlausibleScript } from "@/components/legal/PlausibleScript";

export const metadata: Metadata = {
  metadataBase: new URL("https://stacklite.live"),
  title: {
    default: "Stacklite — The freelancer operating system",
    template: "%s | Stacklite",
  },
  applicationName: "Stacklite",
  description:
    "Free workspace for freelancers. Create contracts, send invoices, track time, and manage clients — all in one place. No sign up needed.",
  keywords: [
    "freelancer workspace",
    "contract generator for freelancers",
    "freelance invoice generator",
    "time tracker for freelancers",
    "client management for freelancers",
    "free freelance tools",
    "freelance contract template",
    "invoice generator free",
    "stacklite",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stacklite.live",
    siteName: "Stacklite",
    title: "Stacklite — The freelancer operating system",
    description:
      "Contracts, invoices, time tracking, and client management — all in one calm workspace. Free, no sign up needed.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stacklite workspace — contracts, invoices, time tracking for freelancers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stacklite — The freelancer operating system",
    description:
      "Free workspace for freelancers. Contracts, invoices, time tracking, client management.",
    images: ["/og-image.png"],
    creator: "@the_siddart",
    site: "@the_siddart",
  },
  icons: {
    icon: "/icon-light.svg",
    shortcut: "/icon-light.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlausibleScript />
        <QueryProvider>
          {children}
          <CookieBanner />
        </QueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
