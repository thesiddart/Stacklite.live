import Link from 'next/link'
import { AppNavbar } from '@/components/layout/AppNavbar'

export default function PrivacyPage() {
  return (
    <div className="theme-page-shell h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--dot-color)_1px,transparent_1px)] bg-[length:16px_16px]" />

      <AppNavbar
        topClassName="top-8"
        zClassName="z-40"
        showThemeButton
        showProfileButton
        showProfileDropdown
        showProfileActiveBorder
      />

      <main className="relative z-10 mx-auto flex h-[calc(100vh-8rem)] w-full max-w-7xl flex-col px-4 pb-4 pt-32 sm:px-6 lg:px-8">
        <article className="theme-shell-panel h-full overflow-y-auto rounded-2xl border border-border-base bg-background-highlight p-6 sm:p-8 lg:p-10">
          <header className="space-y-3 border-b border-border-muted pb-6">
            <h1 className="text-3xl font-semibold text-text-base">Stacklite Privacy Policy</h1>
            <p className="text-sm text-text-muted"><strong>Effective date:</strong> April 2, 2026</p>
            <p className="text-sm text-text-muted"><strong>Last updated:</strong> April 2, 2026</p>
          </header>

          <section className="mt-6 space-y-4 text-sm leading-6 text-text-base">
            <p>
              Stacklite ("we", "our", or "us") is operated by Siddhartha Dwivedi, an individual based in Kathmandu, Nepal.
              This Privacy Policy explains what information we collect, how we use it, and what rights you have over it when you
              use Stacklite at stacklite.live ("the Service").
            </p>
            <p>Please read this carefully. By using the Service, you agree to the practices described here.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">1. Who This Policy Applies To</h2>
            <p className="text-sm text-text-base">This policy applies to:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Visitors who use Stacklite without creating an account (guest mode)</li>
              <li>Users who create an account and use the Service</li>
              <li>Anyone who visits stacklite.live</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-text-base">2. Information We Collect</h2>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-base">2.1 Information You Provide Directly</h3>
              <p className="text-sm text-text-base">When you use Stacklite, you may provide:</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
                <li><strong>Account information</strong> - your name and email address when you sign up</li>
                <li><strong>Profile information</strong> - your name, email, and location used in contracts and invoices</li>
                <li><strong>Client data</strong> - names, email addresses, and company details of your clients</li>
                <li><strong>Contract data</strong> - project scopes, payment terms, deliverables, and clause text</li>
                <li><strong>Invoice data</strong> - line items, rates, payment details, and amounts</li>
                <li><strong>Time entries</strong> - task names, durations, and project notes</li>
              </ul>
              <p className="text-sm text-text-base">This is your professional data. We treat it as such.</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-base">2.2 Information Collected Automatically</h3>
              <p className="text-sm text-text-base">When you use the Service, we may collect:</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
                <li><strong>Log data</strong> - your IP address, browser type, operating system, pages visited, and timestamps</li>
                <li><strong>Usage data</strong> - which features you use, how often, and in what sequence</li>
                <li><strong>Device information</strong> - screen size, device type, and browser version</li>
              </ul>
              <p className="text-sm text-text-base">We use this to operate and improve the Service. We do not sell it.</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-base">2.3 Information from Third-Party Authentication</h3>
              <p className="text-sm text-text-base">If you sign in using Google or GitHub OAuth, we receive:</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your profile picture (if available)</li>
              </ul>
              <p className="text-sm text-text-base">
                We do not receive your password. We do not access your Google or GitHub account data beyond what is needed to
                create your session.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-base">2.4 Guest Mode Data</h3>
              <p className="text-sm text-text-base">
                If you use Stacklite without signing in (guest mode), all data you create - clients, contracts, invoices, time
                entries - is stored locally in your browser using localStorage. This data:
              </p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
                <li>Never leaves your device while in guest mode</li>
                <li>Is not sent to our servers</li>
                <li>Is permanently deleted when you clear your browser storage</li>
                <li>Is migrated to our servers only if you choose to create an account</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">3. How We Use Your Information</h2>
            <p className="text-sm text-text-base">We use the information we collect to:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Provide, operate, and maintain the Service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Generate and display your contracts, invoices, and time entries</li>
              <li>Improve and develop new features</li>
              <li>Respond to your support requests</li>
              <li>Send transactional emails (account confirmation, password reset)</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="text-sm text-text-base">We do <strong>not</strong> use your data to:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>Sell it to advertisers or data brokers</li>
              <li>Display advertising inside the Service</li>
              <li>Build profiles for third-party marketing</li>
              <li>Train AI or machine learning models on your personal or professional content</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-text-base">4. Third-Party Services We Use</h2>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Supabase</h3>
              <p>
                We use Supabase to store your account data, contracts, invoices, clients, and time entries. Supabase stores data
                on servers operated by Amazon Web Services. Supabase complies with GDPR and maintains a SOC 2 Type II certification.
              </p>
              <p>
                For more information:{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" className="text-text-brand underline underline-offset-2">
                  supabase.com/privacy
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Google OAuth</h3>
              <p>If you choose to sign in with Google, authentication is handled by Google. We receive only your name and email.</p>
              <p>
                For more information:{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-text-brand underline underline-offset-2">
                  policies.google.com/privacy
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">GitHub OAuth</h3>
              <p>If you choose to sign in with GitHub, authentication is handled by GitHub. We receive only your name and email.</p>
              <p>
                For more information:{' '}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-brand underline underline-offset-2"
                >
                  docs.github.com/en/site-policy/privacy-policies
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Frankfurter API</h3>
              <p>We use Frankfurter to display currency exchange rates. This is a public, read-only API. No personal data is sent to Frankfurter.</p>
              <p>
                For more information:{' '}
                <a href="https://frankfurter.app" target="_blank" rel="noreferrer" className="text-text-brand underline underline-offset-2">
                  frankfurter.app
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Vercel</h3>
              <p>
                The Service is hosted on Vercel. Vercel may collect standard web log data (IP address, request timestamps) as part
                of hosting infrastructure.
              </p>
              <p>
                For more information:{' '}
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-text-brand underline underline-offset-2">
                  vercel.com/legal/privacy-policy
                </a>
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">5. Data Storage and Security</h2>
            <p className="text-sm text-text-base">Your data is stored in Supabase&apos;s PostgreSQL database. We protect it through:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li><strong>Row Level Security (RLS)</strong> - every database query is scoped to your account. No user can access another user&apos;s data.</li>
              <li><strong>Encrypted connections</strong> - all data is transmitted over HTTPS/TLS</li>
              <li><strong>Authentication tokens</strong> - stored in secure, httpOnly cookies using Supabase&apos;s session management</li>
              <li><strong>No plaintext passwords</strong> - passwords are hashed and managed entirely by Supabase Auth</li>
            </ul>
            <p className="text-sm text-text-base">
              We take reasonable technical and organisational measures to protect your data. However, no system is completely secure.
              If you suspect unauthorised access to your account, contact us immediately.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">6. Data Retention</h2>
            <p className="text-sm text-text-base">We retain your data for as long as your account exists.</p>
            <p className="text-sm text-text-base"><strong>If you delete your account:</strong></p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>All your data - clients, contracts, invoices, time entries - is permanently deleted within 30 days</li>
              <li>Backups are purged within 90 days</li>
            </ul>
            <p className="text-sm text-text-base">
              <strong>Anonymised usage data</strong> (e.g. feature usage statistics with no personal identifiers) may be retained indefinitely for product improvement.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">7. Sharing Your Data</h2>
            <p className="text-sm text-text-base">We do not sell, rent, or share your personal data with third parties for their marketing purposes.</p>
            <p className="text-sm text-text-base">We may share data in the following limited circumstances:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li><strong>Service providers</strong> - as listed in Section 4, to the extent necessary to operate the Service</li>
              <li><strong>Legal requirements</strong> - if required by law, court order, or governmental authority</li>
              <li><strong>Safety</strong> - to protect the rights, property, or safety of Stacklite, our users, or the public</li>
              <li><strong>Business transfer</strong> - if Stacklite is acquired or merged, your data may transfer to the new entity under the same or stricter protections</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-text-base">8. Publicly Accessible Data</h2>
            <p className="text-sm text-text-base">Certain features of Stacklite allow you to share documents publicly:</p>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Shareable Contract Links (/c/[token])</h3>
              <p>
                When you generate a share link for a contract, that contract becomes publicly readable at its unique URL. Anyone with
                the link can view the contract. No login is required.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>The URL uses a randomly generated token, not your internal database ID</li>
                <li>Draft contracts are never accessible via share links</li>
                <li>You can stop sharing a contract by archiving it</li>
              </ul>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Shareable Invoice Links (/i/[token])</h3>
              <p>Same rules apply to invoice share links.</p>
            </div>

            <p className="text-sm text-text-base"><strong>You are responsible for deciding who receives your share links. Treat them like email attachments.</strong></p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-text-base">9. Cookies and Local Storage</h2>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Cookies</h3>
              <p>
                We use cookies for authentication only. When you sign in, Supabase sets a secure session cookie that keeps you logged
                in. We do not use cookies for advertising or tracking.
              </p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Local Storage</h3>
              <p>
                In guest mode, we use your browser&apos;s localStorage to store your workspace data. This data never leaves your device
                unless you create an account and choose to migrate it.
              </p>
              <p>We do not use local storage for tracking or advertising purposes.</p>
            </div>

            <div className="space-y-2 text-sm text-text-base">
              <h3 className="text-lg font-semibold">Do Not Track</h3>
              <p>
                We respect browser Do Not Track signals. When DNT is enabled, we do not use analytics beyond what is operationally
                necessary to run the Service.
              </p>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-text-base">10. Your Rights</h2>
            <p className="text-sm text-text-base">Depending on where you are located, you may have the following rights over your personal data:</p>
            <div className="overflow-x-auto rounded-xl border border-border-base">
              <table className="min-w-full border-collapse text-sm text-text-base">
                <thead className="bg-background-muted">
                  <tr>
                    <th className="border-b border-border-base px-4 py-3 text-left font-semibold">Right</th>
                    <th className="border-b border-border-base px-4 py-3 text-left font-semibold">What it means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3"><strong>Access</strong></td>
                    <td className="border-b border-border-muted px-4 py-3">Request a copy of the data we hold about you</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3"><strong>Correction</strong></td>
                    <td className="border-b border-border-muted px-4 py-3">Request correction of inaccurate data</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3"><strong>Deletion</strong></td>
                    <td className="border-b border-border-muted px-4 py-3">Request deletion of your account and all associated data</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3"><strong>Portability</strong></td>
                    <td className="border-b border-border-muted px-4 py-3">Request your data in a machine-readable format</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3"><strong>Objection</strong></td>
                    <td className="border-b border-border-muted px-4 py-3">Object to certain uses of your data</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3"><strong>Restriction</strong></td>
                    <td className="px-4 py-3">Request we limit how we use your data while a dispute is resolved</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-text-base">To exercise any of these rights, email us at the address in Section 14. We will respond within 30 days.</p>
            <p className="text-sm text-text-base"><strong>EU/EEA and UK residents:</strong> You have additional rights under GDPR and UK GDPR. If you believe we have not handled your data appropriately, you have the right to lodge a complaint with your local data protection authority.</p>
            <p className="text-sm text-text-base"><strong>California residents (CCPA):</strong> You have the right to know what personal information we collect and share, the right to deletion, and the right to opt out of the sale of personal information. We do not sell personal information.</p>
            <p className="text-sm text-text-base"><strong>Nepal residents:</strong> We comply with applicable data protection provisions under Nepali law.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">11. Children&apos;s Privacy</h2>
            <p className="text-sm text-text-base">
              Stacklite is not directed at children under the age of 16. We do not knowingly collect personal information from anyone
              under 16. If you believe a child has provided us with personal information, please contact us and we will delete it.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">12. International Data Transfers</h2>
            <p className="text-sm text-text-base">
              Stacklite is operated from Nepal. Your data may be stored and processed in data centers located in the United States and
              European Union (via Supabase and Vercel infrastructure). By using the Service, you consent to this transfer.
            </p>
            <p className="text-sm text-text-base">
              Where data is transferred outside your home jurisdiction, we rely on appropriate safeguards such as Standard Contractual
              Clauses (for EU data) or equivalent mechanisms.
            </p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">13. Changes to This Policy</h2>
            <p className="text-sm text-text-base">We may update this Privacy Policy from time to time. When we do:</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-text-base">
              <li>We will update the "Last updated" date at the top of this page</li>
              <li>For significant changes, we will notify you by email (if you have an account) or by displaying a notice on the Service</li>
              <li>Continued use of the Service after changes constitutes acceptance of the updated policy</li>
            </ul>
            <p className="text-sm text-text-base">We encourage you to review this policy periodically.</p>
          </section>

          <section className="mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-text-base">14. Contact Us</h2>
            <p className="text-sm text-text-base">If you have questions, concerns, or requests about this Privacy Policy or how we handle your data, contact us:</p>
            <div className="rounded-xl border border-border-base bg-background-muted p-4 text-sm text-text-base">
              <p><strong>Siddhartha Dwivedi</strong></p>
              <p>Product Designer and Operator, Stacklite</p>
              <p>Kathmandu, Nepal</p>
              <p className="mt-2">Email: <strong>info@siddart.net</strong></p>
              <p className="mt-1">Website: <strong>siddart.net</strong></p>
            </div>
            <p className="text-sm text-text-base">We aim to respond to all privacy-related enquiries within 5 business days.</p>
          </section>

          <section className="mt-8 space-y-4 border-t border-border-muted pt-8">
            <h2 className="text-xl font-semibold text-text-base">15. Legal Basis for Processing (EU/EEA Users)</h2>
            <p className="text-sm text-text-base">
              If you are located in the EU or EEA, we process your personal data under the following legal bases:
            </p>
            <div className="overflow-x-auto rounded-xl border border-border-base">
              <table className="min-w-full border-collapse text-sm text-text-base">
                <thead className="bg-background-muted">
                  <tr>
                    <th className="border-b border-border-base px-4 py-3 text-left font-semibold">Processing activity</th>
                    <th className="border-b border-border-base px-4 py-3 text-left font-semibold">Legal basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3">Account creation and authentication</td>
                    <td className="border-b border-border-muted px-4 py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3">Storing your contracts, invoices, clients</td>
                    <td className="border-b border-border-muted px-4 py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3">Sending transactional emails</td>
                    <td className="border-b border-border-muted px-4 py-3">Contractual necessity</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3">Usage analytics and product improvement</td>
                    <td className="border-b border-border-muted px-4 py-3">Legitimate interests</td>
                  </tr>
                  <tr>
                    <td className="border-b border-border-muted px-4 py-3">Complying with legal obligations</td>
                    <td className="border-b border-border-muted px-4 py-3">Legal obligation</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Guest mode localStorage data</td>
                    <td className="px-4 py-3">Consent (implied by use)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-text-base">You may withdraw consent at any time by contacting us or deleting your account.</p>
          </section>

          <footer className="mt-8 border-t border-border-muted pt-6 text-sm text-text-muted">
            <p>Stacklite is a product by Siddhartha Dwivedi · stacklite.live</p>
            <p className="mt-3">
              <Link href="/dashboard" className="text-text-brand underline underline-offset-2">
                Back to Dashboard
              </Link>
            </p>
          </footer>
        </article>
      </main>
    </div>
  )
}
