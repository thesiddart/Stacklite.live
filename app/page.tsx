import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { WorkspaceMock } from '@/components/landing/WorkspaceMock'
import { buildDashboardUrlWithModule, LANDING_WORKSPACE_MODULE_CARDS } from '@/lib/navigation/workspaceModules'

export const metadata: Metadata = {
  title: 'The freelancer operating system',
  description:
    'Contracts, invoices, time tracking, and client management. Everything a freelancer needs in one calm workspace.',
  alternates: { canonical: '/' },
}

const guestHighlights = [
  { title: 'Guest mode starts instantly', detail: 'All data saves for 24 hours in your browser while you explore.' },
  { title: 'Sign up when ready', detail: 'Move from guest mode to account without losing your work.' },
  { title: 'Free in beta', detail: 'No credit card required to start using Stacklite.' },
]

export default function Home() {
  return (
    <div className="dark min-h-screen bg-background-base text-text-base">
      <div className="pointer-events-none fixed inset-0 z-0 dots-background opacity-20 [background-size:20px_20px]" />

      <div className="relative z-10">
        <header className="border-b border-border-muted bg-[var(--color-canvas-bg)] text-text-inverse">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-border-base bg-background-base px-2.5 py-1.5"
            >
              <Image src="/logo-dark.svg" alt="Stacklite" width={96} height={24} priority style={{ width: 'auto', height: '20px' }} />
            </Link>
            <span className="rounded-full border border-border-base bg-background-highlight px-2 py-0.5 text-[10px] text-text-muted">
              Beta
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-text-muted lg:flex">
            <a href="#features" className="rounded-sm focus-visible:ring-2 focus-visible:ring-text-brand hover:text-text-inverse">Features</a>
            <a href="#how-it-works" className="rounded-sm focus-visible:ring-2 focus-visible:ring-text-brand hover:text-text-inverse">How it works</a>
            <a href="#guest" className="rounded-sm focus-visible:ring-2 focus-visible:ring-text-brand hover:text-text-inverse">Guest mode</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border-base bg-transparent !text-text-base hover:bg-background-highlight hover:!text-text-base"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="!text-white hover:!text-white">
              <Link href="/dashboard" className="!text-white hover:!text-white">Try free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-[var(--color-canvas-bg)] text-text-inverse">
          <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-14 pt-16 text-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-base bg-background-highlight px-4 py-1 text-xs text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-button-primary" />
                Free to use - no sign up needed
              </div>

              <h1 className="mx-auto mt-6 max-w-[680px] text-4xl font-bold leading-[1.08] tracking-tight text-text-base sm:text-5xl lg:text-6xl">
                The workspace built for freelancers
              </h1>

              <p className="mx-auto mt-5 max-w-[560px] text-base leading-relaxed text-text-muted">
                Contracts, invoices, time tracking, and client management - all in one calm place. Start in seconds.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="!text-white hover:!text-white">
                  <Link href="/dashboard" className="!text-white hover:!text-white">Open workspace</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-button-primary bg-transparent !text-button-secondary-fg hover:bg-background-highlight hover:!text-button-secondary-fg">
                  <Link href="#how-it-works" className="!text-button-secondary-fg hover:!text-button-secondary-fg">See how it works</Link>
                </Button>
              </div>

              <WorkspaceMock />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-[1200px] px-5 py-16">
          <div className="mb-10 text-center">
            <span className="inline-flex rounded-full border border-border-base bg-background-highlight px-4 py-1 text-xs text-text-muted">
              Five focused modules
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text-base sm:text-4xl">Everything in one workspace</h2>
            <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-text-muted">
              No switching between apps. No separate subscriptions. One calm workspace for freelance operations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            {LANDING_WORKSPACE_MODULE_CARDS.map((module) => (
              <article key={module.id} className="rounded-xl border border-border-base bg-background-highlight p-4">
                <h3 className="text-sm font-medium text-text-base">{module.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{module.description}</p>
                <Link
                  href={buildDashboardUrlWithModule(module.id)}
                  className="mt-3 inline-block text-xs font-medium text-text-brand hover:text-link-hover"
                >
                  Open module →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border-muted bg-background-highlight px-5 py-16 text-center">
          <span className="inline-flex rounded-full border border-border-base bg-background-base px-4 py-1 text-xs text-text-muted">
            Philosophy
          </span>
          <h2 className="mx-auto mt-4 max-w-[620px] text-3xl font-semibold leading-tight text-text-base sm:text-4xl">
            Everything a freelancer needs. Nothing they do not.
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-sm leading-relaxed text-text-muted">
            Most tools are built for agencies and accountants. Stacklite is built for solo freelancers who need reliability and focus.
          </p>
        </section>

        <section id="guest" className="relative isolate px-5 py-16">
          <div className="absolute inset-0 -z-10 dots-background opacity-20 [background-size:20px_20px]" />
          <div className="relative mx-auto grid w-full max-w-[920px] gap-7 rounded-2xl border border-button-primary bg-background-base p-8 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-border-base px-3 py-1 text-xs text-text-muted">No credit card</span>
                <span className="rounded-full border border-border-base px-3 py-1 text-xs text-text-muted">No account</span>
              </div>
              <h2 className="text-3xl font-semibold leading-tight text-text-base">Start working immediately</h2>
              <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-text-muted">
                Land on the workspace and create contracts or invoices right away. Your work saves locally, and you can create an account later to keep everything synced.
              </p>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href="/dashboard">Open the workspace</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {guestHighlights.map((item) => (
                <article key={item.title} className="rounded-lg border border-border-base bg-background-highlight px-4 py-3">
                  <h3 className="text-sm font-medium text-text-base">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-muted bg-background-base">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:hello@stacklite.live">Contact</a>
          </div>
          <p>© 2026 Stacklite · Siddhartha Dwivedi</p>
        </div>
      </footer>
      </div>
    </div>
  )
}
