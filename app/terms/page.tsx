import type { Metadata } from 'next'
import { AppNavbar } from '@/components/layout/AppNavbar'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using Stacklite.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="theme-page-shell h-screen overflow-hidden">
      <div className="dots-background" />

      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
      />

      <main className="relative z-10 mx-auto flex h-[calc(100vh-2rem)] w-full max-w-7xl flex-col px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <article className="theme-shell-panel h-full overflow-y-auto rounded-2xl border border-border-base bg-background-highlight p-6 sm:p-8 lg:p-10">
          <header className="space-y-3 border-b border-border-muted pb-6">
            <h1 className="text-3xl font-semibold text-text-base">Stacklite Terms of Service</h1>
            <p className="text-sm text-text-muted"><strong>Effective date:</strong> April 2, 2026</p>
            <p className="text-sm text-text-muted"><strong>Last updated:</strong> April 5, 2026</p>
          </header>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">1. Acceptance of Terms</h2>
            <p className="text-sm text-text-base">
              By accessing or using Stacklite at stacklite.live (the Service), you agree to be bound by these Terms of
              Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">2. Who Can Use Stacklite</h2>
            <p className="text-sm text-text-base">You must be at least 16 years old to use the Service.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">3. Your Account</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Keep your login credentials secure.</li>
              <li>You are responsible for activity under your account.</li>
              <li>Report unauthorized access to hello@siddart.net.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">4. What You Can Do</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Create and manage contracts, invoices, and client records.</li>
              <li>Track time against projects.</li>
              <li>Share contracts and invoices with generated links.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">5. What You Cannot Do</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Use the Service for illegal purposes.</li>
              <li>Attempt unauthorized access to other users data.</li>
              <li>Reverse-engineer or scrape the Service.</li>
              <li>Resell or sublicense access to the Service.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">6. Your Content</h2>
            <p className="text-sm text-text-base">
              You own your contracts, invoices, and client data. You grant Stacklite a limited license to store and
              display your content solely to provide the Service.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">7. Guest Mode</h2>
            <p className="text-sm text-text-base">
              In guest mode, data is stored locally in your browser. We are not responsible for data loss from browser
              storage clearing or shared device use.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">8. Shared Links</h2>
            <p className="text-sm text-text-base">
              Anyone with a share link may access that document. You are responsible for who receives shared links.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">9. Availability</h2>
            <p className="text-sm text-text-base">We do not guarantee uninterrupted service and may perform maintenance without notice.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">10. Limitation of Liability</h2>
            <p className="text-sm text-text-base">
              To the extent permitted by law, Stacklite is not liable for indirect, incidental, or consequential
              damages. Total liability is capped at the amount paid in the prior 12 months.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">11. Termination</h2>
            <p className="text-sm text-text-base">
              We may suspend or terminate accounts that violate these Terms. You may delete your account at any time.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">12. Changes to Terms</h2>
            <p className="text-sm text-text-base">We may update these Terms. Continued use after changes means acceptance.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">13. Governing Law</h2>
            <p className="text-sm text-text-base">These Terms are governed by the laws of Nepal, with disputes resolved in Kathmandu courts.</p>
          </section>

          <section className="mt-8 space-y-3 border-t border-border-muted pt-6">
            <h2 className="text-xl font-semibold text-text-base">14. Contact</h2>
            <p className="text-sm text-text-base">
              Questions:{' '}
              <a className="text-[var(--primary)] underline underline-offset-2" href="mailto:hello@siddart.net">
                hello@siddart.net
              </a>
            </p>
          </section>
        </article>
      </main>
    </div>
  )
}
