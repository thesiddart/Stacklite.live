# Stacklite — Guest Mode & First Visit Flow
> For Claude Code · Updated Plan · April 2026
> Replaces: stacklite-guest-mode-plan.md (first visit flow section)

---

## Core Decision

Users land directly on the workspace as a guest. No auth page on first visit. No decision required before seeing the product.

The auth page exists at `/sign-in` but is never the entry point for new visitors.

---

## First Visit Flow

```
Visit stacklite.app
        │
        ▼
Workspace loads instantly (guest mode)
        │
        ├── All modules available immediately
        ├── Data saves to localStorage automatically
        ├── No prompt, no popup, no friction
        │
        └── User works freely
                │
                ▼
        Hits Download PDF or Copy Share Link
                │
                ▼
        ┌─────────────────────────────────┐
        │         Save Prompt             │
        │                                 │
        │  Save your work permanently     │
        │                                 │
        │  [Create Free Account]          │
        │  [Continue as Guest]            │
        └─────────────────────────────────┘
                │               │
                ▼               ▼
          Sign up &        Action executes
          migrate data     (no account)
```

---

## Route Logic

```ts
// src/middleware.ts

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSession(request)

  // Root → always workspace
  // Workspace handles guest vs auth state internally
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  // Sign in page → redirect to workspace if already authenticated
  if (pathname === '/sign-in' && session) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }
}
```

**Route summary:**

| Route | Behaviour |
|---|---|
| `/` | Always redirects to `/workspace` |
| `/workspace` | Loads for both guest and authenticated users |
| `/sign-in` | Only reachable manually — redirects away if already authed |
| `/c/[token]` | Public contract view — no auth required |
| `/i/[token]` | Public invoice view — no auth required |

---

## Top Bar — Three States

### State 1 — Fresh Guest (no data yet)

```
[Stacklite logo]                    [clock]  [Sign In]
```

No guest indicator. User just landed — nothing to save yet. Clean, calm, no noise.

### State 2 — Active Guest (has created something)

```
[Stacklite logo]   [💾 Guest session · Save your work →]   [clock]  [Sign In]
```

Guest indicator appears only after the user has at least one client, contract, invoice, or time entry. Reminds them their work is browser-only without being pushy.

### State 3 — Authenticated User

```
[Stacklite logo]                    [clock]  [avatar]
```

Guest indicator gone. Sign In button replaced by user avatar. Clean.

---

## Top Bar Component

```tsx
// src/components/workspace/TopBar.tsx

export function TopBar() {
  const { isGuest }  = useSessionStore()
  const { session }  = useSupabaseAuth()
  const hasGuestData = useGuestStore((s) =>
    s.clients.length > 0     ||
    s.contracts.length > 0   ||
    s.invoices.length > 0    ||
    s.timeEntries.length > 0
  )

  return (
    <div className="flex items-center justify-between px-4 py-2
                    bg-background-base border-b border-border-muted">

      {/* Left — Logo */}
      <StackliteLogo />

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Guest indicator — only when guest has actual data */}
        {isGuest && hasGuestData && (
          <GuestIndicator />
        )}

        {/* Clock */}
        <WorkspaceClock />

        {/* Sign In OR Avatar */}
        {session ? (
          <UserAvatar session={session} />
        ) : (
          <SignInButton />
        )}

      </div>
    </div>
  )
}
```

---

## Sign In Button Component

Replaces the avatar icon until the user is authenticated.

```tsx
// src/components/workspace/SignInButton.tsx

export function SignInButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/sign-in')}
      aria-label="Sign in to Stacklite"
      className="px-3 py-1.5 rounded-lg text-xs font-medium
                 bg-button-primary text-button-primaryFg
                 hover:opacity-90 transition-opacity"
    >
      Sign In
    </button>
  )
}
```

---

## Guest Indicator Component

Only renders when `isGuest === true` AND user has created data.

```tsx
// src/components/workspace/GuestIndicator.tsx

export function GuestIndicator() {
  const { isGuest }       = useSessionStore()
  const { openSavePrompt } = useSavePromptStore()
  const pathname          = usePathname()

  // Never show on auth page or public contract/invoice pages
  if (!isGuest) return null
  if (pathname === '/sign-in') return null
  if (pathname.startsWith('/c/')) return null
  if (pathname.startsWith('/i/')) return null

  return (
    <button
      onClick={openSavePrompt}
      aria-label="Save your guest session"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-background-highlight text-text-muted text-xs
                 hover:text-text-base transition-colors"
    >
      <span>💾</span>
      <span>Guest session · Save your work</span>
    </button>
  )
}
```

---

## Updated Auth Page (`/sign-in`)

The auth page is simplified — no guest option needed since landing on the workspace already IS the guest experience.

**Remove from auth page:**
- ❌ "Try Without Account" button
- ❌ "No sign up needed · Your work saves in your browser" caption
- ❌ The `or` divider above the guest button

**Keep on auth page:**
- ✅ Google OAuth
- ✅ Github OAuth
- ✅ Email + password
- ✅ Create New Account
- ✅ Forgot your password

The auth page is only reached by:
- Clicking the `Sign In` button in the top bar
- Clicking the `Guest session · Save your work →` indicator
- Clicking `Create Account` inside the Save Prompt modal

---

## Session Initialization

When the workspace loads for a new visitor with no Supabase session and no existing `guestStore` data:

```ts
// src/stores/sessionStore.ts

// On workspace mount — check session state
export function initSession() {
  const supabaseSession = getSupabaseSession()
  const hasGuestData    = checkGuestStoreHasData()

  if (supabaseSession) {
    // Authenticated user — normal Supabase flow
    useSessionStore.setState({ isGuest: false })
    return
  }

  // No session — treat as guest automatically
  // No prompt, no redirect, no friction
  useSessionStore.setState({ isGuest: true })
}
```

This runs once on workspace mount. The user never sees a loading state for this — it resolves before the canvas renders.

---

## Save Prompt — Updated Trigger Points

The save prompt is the ONLY point where a guest is asked about their account. It triggers on:

| Action | Module |
|---|---|
| Download PDF | Contract Generator |
| Copy Share Link | Contract Generator |
| Download PDF | Invoice Generator |
| Copy Share Link | Invoice Generator |

**The action always executes regardless of what the user chooses.** The prompt appears alongside or after — never before.

```ts
// Pattern used in every trigger point

const handleDownloadPDF = () => {
  const download = () => generateAndDownloadPDF(data)

  if (isGuest) {
    openWithAction(download)   // show prompt + pass action
  } else {
    download()                 // authenticated — just do it
  }
}
```

---

## Save Prompt Modal — Updated Copy

Since users now arrive as guests without choosing to, the copy should feel helpful not alarming.

```tsx
// src/components/workspace/SavePromptModal.tsx

// Heading
"Save your work permanently"

// Body
"You're working in guest mode — your work is saved in this browser.
 Create a free account to access it from anywhere, anytime."

// Primary CTA
"Create Free Account"

// Secondary
"Continue as Guest"

// Footer note
"Your current work stays safe until you close this browser."
```

---

## Data Persistence Rules (Unchanged)

- Guest data stored in `localStorage` via Zustand `persist`
- Survives page refresh — lost only when browser storage is cleared
- `localStorage` key: `stacklite-guest-data`
- Session flag key: `stacklite-session`
- Never call Supabase when `isGuest === true`
- Never clear `guestStore` unless migration has fully succeeded

---

## Migration on Sign Up (Unchanged)

When a guest creates an account, all localStorage data migrates to Supabase before they land on the workspace. The user never loses their work.

```
Guest signs up
      │
      ▼
Auth callback fires → reads migrate flag
      │
      ▼
migrateGuestData(userId) called
      │
      ├── Insert clients → Supabase (map old IDs to new)
      ├── Insert contracts → Supabase
      ├── Insert invoices → Supabase
      └── Insert time entries → Supabase
      │
      ▼
Migration success → guestStore.clearAll()
      │
      ▼
sessionStore.setGuest(false)
      │
      ▼
Redirect to /workspace
(all their data is already there)
```

If migration fails — guest data stays in localStorage, soft toast appears, user can retry. Their work is never lost.

---

## What Does NOT Change

- All 5 modules work fully in guest mode
- `guestStore` shape and types are unchanged
- Data access hooks (`useClients`, `useContracts`, etc.) are unchanged
- Migration function `migrateGuestData.ts` is unchanged
- RLS policies are unchanged
- `nanoid()` for guest IDs — unchanged

---

## File Changes Summary

| File | Change |
|---|---|
| `src/middleware.ts` | Root `/` always redirects to `/workspace` |
| `src/components/workspace/TopBar.tsx` | New three-state logic |
| `src/components/workspace/SignInButton.tsx` | New component — replaces avatar when guest |
| `src/components/workspace/GuestIndicator.tsx` | Add pathname guard — hide on auth + public pages |
| `src/app/(auth)/sign-in/page.tsx` | Remove "Try Without Account" section |
| `src/app/workspace/page.tsx` | Call `initSession()` on mount |
| `src/stores/sessionStore.ts` | Add `initSession()` function |

---

## Implementation Order

1. `sessionStore.ts` — add `initSession()`
2. `src/middleware.ts` — root redirect to workspace
3. `TopBar.tsx` — three-state logic
4. `SignInButton.tsx` — new component
5. `GuestIndicator.tsx` — add pathname guards
6. `workspace/page.tsx` — call `initSession()` on mount
7. `sign-in/page.tsx` — remove guest option section
8. Test full flow: new visit → work → save prompt → sign up → migration

---

*Guest Mode & First Visit Flow — Stacklite by Siddhartha Dwivedi*
*Status: Ready for implementation · Supersedes previous auth page entry point*
