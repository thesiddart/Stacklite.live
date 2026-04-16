# Stacklite — Testing Methods & Protocols

Last updated: 2026-04-16

This document is the canonical testing reference for Stacklite. It defines **what** to test, **how** to test it, and the **protocol** for running, reviewing, and signing off on tests across the codebase. Use it alongside `SECURITY_AUDIT.md` and `CLAUDE.md`.

---

## 1. Goals

The Stacklite test strategy must verify the following at all times:

1. **Data isolation** — a user can never read or write another user's data.
2. **Guest mode integrity** — when `isGuest === true`, no Supabase call is ever made; guest data is never lost on a failed migration.
3. **Money correctness** — invoice subtotals, tax, discount, and totals are deterministic and rounded to 2 decimal places.
4. **Time correctness** — timer durations, pauses, resumes, and persistence across reloads compute the same elapsed time.
5. **Validation symmetry** — every payload validated client-side is independently re-validated server-side (Zod).
6. **Auth & route protection** — protected routes redirect unauthenticated, non-guest users; signed-in users cannot land back on auth pages.
7. **Design-system compliance** — no raw hex/Tailwind default colors leak into production.
8. **Accessibility** — every interactive element is reachable by keyboard with a visible focus ring and a meaningful label.
9. **PDF integrity** — generated PDFs match expected layout, contain the Stacklite footer, and never leave the browser.

---

## 2. Test Stack

| Layer                  | Tool                                       | Status         |
|------------------------|--------------------------------------------|----------------|
| Unit (pure logic)      | **Vitest** (`vitest run`)                  | In use         |
| Component / DOM        | Vitest + `@testing-library/react` + jsdom  | To be added    |
| Hook tests             | Vitest + `@testing-library/react` (renderHook) | To be added |
| E2E / browser          | **Playwright**                             | To be added    |
| Accessibility          | `@axe-core/playwright` + manual audit      | To be added    |
| Visual regression      | Playwright screenshot diff (optional)      | Future         |
| Type safety            | `tsc --noEmit` (`npm run type-check`)      | In use         |
| Lint                   | `eslint` (`npm run lint`)                  | In use         |
| Dependency audit       | `npm audit`                                | In use         |
| Manual API smoke       | Supabase SQL editor + `curl`               | Manual         |

### Why this split

- Vitest covers **everything pure** — Zod schemas, calculation utils, time math, date helpers. Fast feedback, no browser needed.
- Testing Library + jsdom covers **components and hooks** — render output, form behaviors, user event flows.
- Playwright covers the **canvas, multi-module workflow, auth, guest mode, PDF download** — anything that depends on real browser, real cookies, and real Supabase session.

---

## 3. Directory Layout

```
tests/
├── lib/                       # Pure unit tests (Vitest, node env)
│   ├── utils/
│   │   ├── time.test.ts                  ✅ exists
│   │   └── invoiceCalculations.test.ts   ➕ add
│   └── validations/
│       ├── client.test.ts                ✅ exists
│       ├── timeLog.test.ts               ✅ exists
│       ├── contract.test.ts              ➕ add
│       └── invoice.test.ts               ➕ add
├── stores/                    # Zustand store unit tests (Vitest, node env)
│   ├── guestStore.test.ts                ➕ add
│   ├── timerStore.test.ts                ➕ add
│   ├── sessionStore.test.ts              ➕ add
│   └── savePromptStore.test.ts           ➕ add
├── lib/migration/
│   └── migrateGuestData.test.ts          ➕ add (mock Supabase client)
├── components/                # Component tests (Vitest, jsdom env)
│   ├── modules/
│   │   ├── ContractGenerator/
│   │   ├── InvoiceGenerator/
│   │   ├── TimeTracker/
│   │   └── ClientManager/
│   └── workspace/
│       ├── Canvas.test.tsx
│       └── ModuleCard.test.tsx
├── hooks/                     # Hook tests (Vitest, jsdom env)
│   ├── useAuth.test.ts
│   ├── useClients.test.ts
│   ├── useContracts.test.ts
│   ├── useInvoices.test.ts
│   └── useTimeLogs.test.ts
├── e2e/                       # Playwright tests
│   ├── auth.spec.ts
│   ├── guest-mode.spec.ts
│   ├── guest-migration.spec.ts
│   ├── contract-generator.spec.ts
│   ├── invoice-generator.spec.ts
│   ├── time-tracker.spec.ts
│   ├── client-manager.spec.ts
│   └── a11y.spec.ts
└── fixtures/                  # Reusable factories & mock data
    ├── clients.ts
    ├── contracts.ts
    ├── invoices.ts
    └── timeLogs.ts
```

The Vitest config (`vitest.config.ts`) currently scopes to `tests/**/*.test.ts`. When adding component tests, also enable `*.test.tsx` and provide a jsdom workspace.

---

## 4. Test Categories

### 4.1 Unit Tests — Pure Logic

**Run with:** `npm run test`

**Scope:** anything in `lib/` that is a pure function, no side effects, no React.

**Required coverage:**

| File | What to assert |
|------|----------------|
| `lib/utils/time.ts` | duration formatting, elapsed math, day/week boundaries, timer status derivation. ✅ covered |
| `lib/utils/invoiceCalculations.ts` | `calcLineAmount`, `calcSubtotal`, `calcTax`, `calcDiscount` (flat & percent), `calcTotal`, `isOverdue`, `getDisplayStatus`, `generateInvoiceNumber`. Verify rounding edge cases (e.g. 0.1 + 0.2), zero quantities, 100% discount, negative scenarios should throw at the schema layer not here. |
| `lib/validations/client.ts` | empty-string normalization, currency default → `USD`, tags CSV → array, metadata JSON parse, invalid email/url/currency rejection. Partially covered. |
| `lib/validations/timeLog.ts` | start/manual/update/action schemas, capitalize first letter, positive duration enforcement, UUID enforcement. Partially covered. |
| `lib/validations/contract.ts` | required clientId UUID, scope length bounds, payment terms required. ➕ add |
| `lib/validations/invoice.ts` | line item array min 1, positive quantity/rate, tax 0–100, due date ≥ issue date (if enforced). ➕ add |

**Rules for a good unit test:**

- One behavior per `it()`.
- No mocks unless you're asserting a contract — pure functions don't need them.
- Fix `Date.now()` with `vi.useFakeTimers()` for any timer/elapsed assertions.
- Use real numbers users see (e.g. `12.99`, `0.07` tax) — don't only test round numbers.

### 4.2 Store Tests (Zustand)

**Scope:** `stores/*.ts`. Each store is a state machine — test transitions, not implementation.

**Required scenarios:**

- `guestStore`: add → update → delete for each entity; `clearAll` empties everything; data survives refreshes within 24 hours and clears after TTL expiration.
- `timerStore`: start → pause → resume → stop produces a deterministic `elapsedMs`; only one timer can be active; reload (re-hydrate) does not lose elapsed time on a paused timer.
- `sessionStore`: `setGuest(true)` sets `isGuest`; cookie state stays in sync.
- `savePromptStore`: opens on download/share, never blocks the underlying action.

**Pattern:**

```ts
import { useGuestStore } from '@/stores/guestStore'
beforeEach(() => useGuestStore.setState({ clients: [], contracts: [], invoices: [], timeEntries: [] }))
```

### 4.3 Hook Tests

**Scope:** all `hooks/*`. Most are React-Query wrappers around `lib/api/*` plus guest-store fallbacks.

**What to verify per hook:**

1. **Guest branch** — when `useSessionStore.getState().isGuest === true`:
   - mutation writes to `useGuestStore`, never touches Supabase.
   - returned data is `guestStore` content shaped to the Supabase row interface (e.g. `useInvoices` already does `guestToInvoice`).
2. **Authed branch** — when `isGuest === false`, the `lib/api/*` function is invoked exactly once with the validated payload.
3. **Error path** — schema rejection surfaces as a thrown error; query/mutation enters `error` state.
4. **Cache invalidation** — after a successful mutation, the matching `queryKey` is invalidated.

Mock Supabase by mocking `@/lib/supabase/client`'s `createClient` factory.

### 4.4 Component Tests

**Scope:** any component in `components/modules/**` and `components/workspace/**` that has user-visible logic.

**Per module checklist:**

- **Empty state** — renders an explicit empty state (CLAUDE.md hard rule, never blank).
- **Form validation** — invalid input shows the Zod error message inline; submit is blocked.
- **Destructive actions** — delete buttons open a confirmation dialog; cancel does not delete; confirm calls the delete mutation exactly once.
- **Icon-only buttons** — assert `aria-label` is present and a tooltip is wired.
- **Inputs** — every form `<input>` has an associated `<label>`. Use `getByLabelText`, not `getByPlaceholderText`.
- **Lumea tokens only** — snapshot `className` strings to ensure no `bg-violet-*`, `text-gray-*`, etc., slipped in (a static lint rule below is faster).

### 4.5 Integration / E2E (Playwright)

**Scope:** the user-visible surface — auth, guest mode, the canvas, PDF downloads, share links.

**Required suites:**

#### `auth.spec.ts`

- Sign up with email → confirms profile row is created (via Supabase REST in test setup, **not** the user-facing UI).
- Sign in → redirected to `/dashboard`.
- Already-signed-in user visits `/login` → redirected to `/dashboard`.
- Unauthenticated user visits `/clients` → redirected to `/login?redirectedFrom=/clients`.
- Sign out clears session cookies.

#### `guest-mode.spec.ts`

- Click "Try without signing up" → `stacklite-guest=true` cookie is set.
- Visit `/contracts` as guest → loads canvas, no `/auth/v1/*` requests issued (verify with `page.route`).
- Create a contract as guest → entry appears in `localStorage` under key `stacklite-guest-data`.
- Refresh the page within 24 hours → contract is still present.
- Set guest `createdAt` to older than 24 hours in DevTools → refresh clears guest data.

#### `guest-migration.spec.ts`

- Seed `localStorage` with one client + one contract + one time entry.
- Sign up.
- Verify Supabase rows created with correct `user_id`.
- Verify `localStorage` is cleared **only after** all inserts succeeded.
- Force-fail one insert (e.g. by stubbing the Supabase response) → `localStorage` must remain populated and the user must see an error.

#### `contract-generator.spec.ts`

- Open Contract Generator card → fill required fields → generate PDF → assert downloaded file starts with `Contract_` and is non-zero bytes.
- Edit existing contract → save → re-open shows updated values.
- Delete contract → confirmation dialog → confirm → row removed.

#### `invoice-generator.spec.ts`

- Add multiple line items with decimal rates → subtotal rounds to 2 dp.
- Apply 10% discount + 18% tax → total matches `calcTotal` math.
- Mark paid → status flips, `paid_at` set.
- Generate PDF → file name matches `Invoice_<number>_<client>.pdf`.

#### `time-tracker.spec.ts`

- Start timer → pause → wait → resume → stop. Final saved duration matches expected within 2-second tolerance.
- Start two timers → only the latest is active (timerStore invariant).
- Reload page mid-run → timer continues with correct elapsed.
- Add a manual entry → appears in list immediately.

#### `client-manager.spec.ts`

- Create client with all optional fields blank → row created with normalized `null`s.
- Edit client → shows updated values across modules (invoice client dropdown, contract dropdown).
- Delete client → contracts/time-logs that reference it nullify their `client_id` (per ON DELETE SET NULL).

#### `a11y.spec.ts`

For each module:

```ts
import AxeBuilder from '@axe-core/playwright'
const results = await new AxeBuilder({ page }).analyze()
expect(results.violations).toEqual([])
```

Block PR merges on any **serious** or **critical** axe violation.

### 4.6 Security Tests

These run as part of the audit cadence in `SECURITY_AUDIT.md` §5. The protocol below makes them executable.

**Test 1 — RLS isolation**

In a Supabase test project, create two users `userA`, `userB`:

```sql
-- as userA
insert into clients (user_id, name) values (auth.uid(), 'A-only');
-- as userB
select * from clients where user_id != auth.uid(); -- must return 0 rows
update clients set name = 'pwned' where user_id != auth.uid(); -- must affect 0 rows
delete from clients where user_id != auth.uid(); -- must affect 0 rows
```

Repeat for `contracts`, `invoices`, `invoice_items`, `time_logs`, `cookie_consents`.

**Test 2 — Service role key never reaches the browser**

```bash
npm run build
grep -r "SUPABASE_SERVICE_ROLE_KEY\|service_role" .next/static .next/server/app | grep -v sourcemap
# must be empty
```

**Test 3 — No raw HTML injection**

Static scan from `SECURITY_AUDIT.md` §5.2 must remain clean for `dangerouslySetInnerHTML`, `innerHTML =`, `eval(`, `new Function(`.

**Test 4 — Server-side validation is independent**

For each module mutation, send a payload that **passes** the client schema but is corrupted in transit (e.g. via Postman). The server-side validator must reject it. This proves we are not trusting the client.

**Test 5 — Auth bypass attempts**

- Hit `/dashboard` with no cookie → 307 to `/login`.
- Hit `/dashboard` with `stacklite-guest=true` only → 200 (guest path).
- Hit `/dashboard` with a forged `sb-access-token` cookie containing random bytes → 307 to `/login` (Supabase rejects the JWT).

### 4.7 Color & Token Compliance Test

Runs in CI as a static check — no test framework required:

```bash
# Fail the build if any forbidden color class shows up in components
grep -RnE 'bg-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|slate|zinc|neutral|stone)-[0-9]+|text-(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|gray|slate|zinc|neutral|stone)-[0-9]+|#[0-9a-fA-F]{3,8}\b' \
  components/ app/ \
  --include='*.tsx' --include='*.ts' \
  | grep -v -E '(globals\.css|tailwind\.config\.ts)' \
  && exit 1 || exit 0
```

Wire this into a `npm run lint:colors` script and run it in CI. CLAUDE.md treats this as a hard rule — the test exists to enforce it mechanically.

### 4.8 Type & Lint Gates

```bash
npm run type-check   # tsc --noEmit, strict mode
npm run lint         # eslint
```

Both must exit `0`. Treat any new `any`, `@ts-ignore`, or `@ts-expect-error` as a release blocker.

---

## 5. Local Run Protocol

Before opening a PR, run the **full local battery**:

```bash
npm run lint
npm run type-check
npm run test
npm run build
# optional but recommended for changes touching the canvas, forms, or auth:
npx playwright test
```

If any one fails, **fix before pushing**. Do not skip hooks (`--no-verify`) under any circumstance — see CLAUDE.md hard stops.

### 5.1 Quick smoke test

For tiny changes that don't touch state, money, or auth:

```bash
npm run test -- --changed   # vitest only re-runs tests for changed files
npm run lint
```

### 5.2 Watch mode

```bash
npm run test:watch
```

Use for TDD on Zod schemas and pure utilities.

---

## 6. CI Protocol (recommended GitHub Actions stages)

```
1. install       — npm ci
2. lint          — npm run lint
3. type-check    — npm run type-check
4. unit          — npm run test
5. lint:colors   — token compliance script (§4.7)
6. build         — npm run build
7. e2e           — npx playwright test --reporter=html (on PR + main)
8. audit         — npm audit --omit=dev (warn-only on moderate, fail on high)
```

Each stage runs in its own job. Stage 7 should boot a Supabase preview branch (or a dedicated test project) — never run e2e against production data.

---

## 7. Data & Fixtures

### 7.1 Test database isolation

- E2E and security tests must never run against the production Supabase project.
- Use a dedicated **`stacklite-test`** Supabase project, or a Supabase branch.
- Each e2e test must clean up after itself in `afterEach` (delete its rows by `user_id`).

### 7.2 Fixture factories

Build small factories under `tests/fixtures/` so tests never duplicate row shapes:

```ts
// tests/fixtures/clients.ts
import { nanoid } from 'nanoid'
import type { GuestClient } from '@/lib/types/guest'

export function makeGuestClient(overrides: Partial<GuestClient> = {}): GuestClient {
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    name: 'Acme Studio',
    email: null, phone: null, company_name: null, address: null,
    notes: null, tags: null, is_active: true,
    created_at: now, updated_at: now,
    ...overrides,
  }
}
```

Use these in every store/migration test.

---

## 8. Manual QA Protocol

For releases or any change that touches multiple modules, run this in a fresh browser profile:

### Guest flow
- [ ] Land on `/` → click "Try without signing up" → canvas loads.
- [ ] Open each of the five modules; each has a working empty state.
- [ ] Create one of every entity (client, contract, invoice, time entry).
- [ ] Refresh — all entities still present.
- [ ] Open DevTools → Network → confirm no requests to `*.supabase.co/auth/*` or `*.supabase.co/rest/*`.

### Auth & migration flow
- [ ] From the guest session above, click "Save my work" → sign up with email.
- [ ] After signup, all guest entities appear under the new account.
- [ ] `localStorage.stacklite-guest-data` is empty.
- [ ] Sign out, sign back in → entities still present.

### Money correctness
- [ ] Create an invoice with line items: `(2 × 49.99) + (1 × 100)` → subtotal `199.98`.
- [ ] Apply 18% tax → tax `35.996` → total displays `235.98`.
- [ ] Apply 10% discount → discount `19.998` → total `215.98`.
- [ ] Mark paid → status badge flips, `paid_at` recorded.

### Time correctness
- [ ] Start a timer; after ~30s, pause; verify display freezes.
- [ ] Reload the page; timer is still paused at the same elapsed value.
- [ ] Resume; verify the elapsed value continues from where it stopped.
- [ ] Stop; saved duration matches displayed duration ±1s.

### PDF
- [ ] Generate a contract PDF; file name matches `Contract_<Client>_<Project>.pdf`.
- [ ] Open the PDF; footer reads "Generated with Stacklite".
- [ ] Generate an invoice PDF; file name matches `Invoice_<Number>_<Client>.pdf`.
- [ ] In DevTools → Network, confirm no PDF body bytes were uploaded to a remote endpoint.

### A11y spot check
- [ ] Tab through the dock and one full module — focus ring visible at every stop.
- [ ] Use VoiceOver/NVDA on the dashboard — every icon-only button announces its label.

### Cookie consent
- [ ] Fresh profile shows the cookie banner.
- [ ] Decline → analytics calls suppressed.
- [ ] Accept → `cookie_consents` row written for the signed-in user with the current `policy_version`.

---

## 9. Bug-fix Protocol (regression discipline)

When fixing any bug:

1. **Reproduce in a test first.** Write a failing unit/component/e2e test that captures the bug.
2. Land the fix in the same PR.
3. Confirm the new test passes and that no other test was loosened to make it pass.
4. If the bug touched money, time, auth, or RLS, add a note to `SECURITY_AUDIT.md` §7 (audit snapshot).

---

## 10. Pass / Fail Gates

A PR may merge only if **all** of the following hold:

- ✅ `npm run lint` — exit 0
- ✅ `npm run type-check` — exit 0
- ✅ `npm run test` — all tests pass, no `.skip` introduced
- ✅ `npm run build` — exit 0, no warnings about secrets
- ✅ Color/token static check — exit 0
- ✅ E2E suite (when present) — green on PR
- ✅ `npm audit` — no new **high** advisories without a documented mitigation
- ✅ Any new table includes RLS + user-scoped policy in the same migration
- ✅ Any new mutation is validated by Zod on both client and server

Any change to `globals.css` tokens, RLS policies, or migration files requires explicit approval per CLAUDE.md.

---

## 11. Open Items

Tracked here so the next contributor knows what to pick up:

- [ ] Add jsdom + Testing Library to `vitest.config.ts` and split unit vs DOM projects.
- [ ] Add Playwright + a `stacklite-test` Supabase project; wire e2e job in CI.
- [ ] Add `lint:colors` npm script and CI step.
- [ ] Backfill validation tests for `contract.ts` and `invoice.ts`.
- [ ] Backfill store tests for `guestStore`, `timerStore`, `sessionStore`, `savePromptStore`.
- [ ] Backfill `migrateGuestData` test with a mocked Supabase client (cover failure rollback).
- [ ] Resolve the `flatted` and `next` advisories from the 2026-03-23 audit snapshot.

---

*Stacklite — Built by Siddhartha Dwivedi*
