import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Stacklite - Freelancer Operating System",
  description: "A modular freelance workspace for solo professionals. Manage clients, contracts, invoices, and time tracking in one place.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
        <Analytics />
      </body>
    </html>
  );
}
