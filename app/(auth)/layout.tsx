import type { Metadata } from "next";

/** Login and signup are not useful search results; keep them out of the index. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
