import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "Stacklite - Freelancer Workspace",
    template: "%s | Stacklite",
  },
  description:
    "A modular freelancer workspace for contracts, invoices, time tracking, and client management. Free to use, no sign-up required.",
  metadataBase: new URL("https://stacklite.live"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stacklite.live",
    siteName: "Stacklite",
    title: "Stacklite - Freelancer Workspace",
    description:
      "Contracts, invoices, time tracking, and client management. All in one calm workspace.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stacklite - The freelancer operating system",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stacklite - Freelancer Workspace",
    description: "Contracts, invoices, time tracking, and client management.",
    images: ["/og-image.png"],
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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
