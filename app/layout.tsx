import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Stacklite - Freelancer Operating System",
  description: "A modular freelance workspace for solo professionals. Manage clients, contracts, invoices, and time tracking in one place.",
  icons: {
    icon: "/icon-light.svg",
    shortcut: "/icon-light.svg",
    apple: "/icon-light.svg",
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
