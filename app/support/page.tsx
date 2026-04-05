import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with Stacklite.',
  robots: { index: true, follow: true },
}

export default function SupportPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-base p-6">
      <div className="max-w-sm text-center">
        <h1 className="mb-3 text-2xl font-semibold text-text-base">Get in touch</h1>
        <p className="mb-6 text-sm text-text-muted">
          Have a question, bug report, or feature request? We respond within 2 business days.
        </p>
        <a
          href="mailto:hello@siddart.net"
          className="inline-block rounded-lg bg-button-primary px-6 py-3 text-sm font-medium text-button-primaryFg"
        >
          hello@siddart.net
        </a>
        <p className="mt-6 text-xs text-text-muted">
          <a href="/privacy" className="hover:text-text-base">Privacy Policy</a>
          {' · '}
          <a href="/terms" className="hover:text-text-base">Terms of Service</a>
        </p>
      </div>
    </main>
  )
}
