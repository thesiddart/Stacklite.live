import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="theme-page-shell flex min-h-screen items-center justify-center px-4">
      <div className="theme-shell-panel w-full max-w-md rounded-2xl p-8 text-center">
        <p className="text-sm text-text-muted">Page not found</p>
        <h1 className="mt-2 text-3xl font-semibold text-text-base">404</h1>
        <p className="mt-2 text-sm text-text-muted">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-button-primary px-4 py-2 text-sm font-medium text-button-primaryFg transition-opacity hover:opacity-90"
        >
          Back to workspace
        </Link>
      </div>
    </div>
  )
}
