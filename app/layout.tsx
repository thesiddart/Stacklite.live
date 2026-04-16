import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { PlausibleScript } from "@/components/legal/PlausibleScript";

export const metadata: Metadata = {
  title: {
    default: "Stacklite - The freelancer operating system",
    template: "%s | Stacklite",
  },
  applicationName: "Stacklite",
  description:
    "Contracts, invoices, time tracking, and client management - all in one calm workspace. Free to use, no sign up needed.",
  keywords: [
    "freelancer workspace",
    "contract generator",
    "invoice generator",
    "time tracker",
    "client manager",
    "stacklite",
  ],
  metadataBase: new URL("https://stacklite.live"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stacklite.live",
    siteName: "Stacklite",
    title: "Stacklite - The freelancer operating system",
    description:
      "Contracts, invoices, time tracking, and client management in one calm workspace.",
    images: [
      {
        url: "https://stacklite.live/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stacklite workspace preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stacklite - The freelancer operating system",
    description: "Contracts, invoices, time tracking, and client management in one workspace.",
    images: ["https://stacklite.live/og-image.png"],
    creator: "@the_siddart",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-light.svg",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
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
        <QueryProvider>{children}</QueryProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
