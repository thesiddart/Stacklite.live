# Stacklite - Implementation Plan

**Version:** 1.0  
**Date:** February 12, 2026  
**Status:** Approved - Implementation Starting

---

## Executive Summary

This document outlines the complete implementation plan for Stacklite, a production-ready SaaS application for freelancers. The implementation follows a 12-week phased approach, starting with core infrastructure and authentication, then building out the five core modules: Client Manager, Time Tracker, Contract Generator, Invoice Generator, and Income Tracker.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router)
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** React Query + Zustand
- **PDF Generation:** @react-pdf/renderer
- **Styling:** Tailwind CSS (matching Figma design system)
- **Language:** TypeScript

---

## Phase 1: Core Foundation (Weeks 1-2)

### Objective
Set up production-ready infrastructure with authentication and basic layout structure.

### Tasks

#### 1.1 Project Initialization
- [x] Create Next.js 14 project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Setup ESLint + Prettier
- [ ] Initialize Git repository
- [ ] Create .gitignore and environment templates
- [ ] Setup folder structure per architecture plan

#### 1.2 Supabase Configuration
- [ ] Create Supabase project (development/staging)
- [ ] Create database schema (all tables)
- [ ] Implement Row Level Security policies
- [ ] Seed development data
- [ ] Setup database migrations
- [ ] Configure environment variables

**Database Tables to Create:**
```sql
-- profiles (user metadata)
-- clients (client management)
-- contracts (contract storage)
-- invoices (invoice storage)
-- invoice_items (invoice line items)
-- time_logs (time tracking)
```

#### 1.3 Authentication Implementation
- [ ] Install @supabase/ssr and @supabase/supabase-js
- [ ] Create Supabase client (client-side + server-side)
- [ ] Implement middleware for route protection
- [ ] Build auth UI pages (login, signup)
- [ ] Implement email/password authentication
- [ ] Setup Google OAuth
- [ ] Setup Apple OAuth (if time permits, else Phase 2)
- [ ] Create auth state management (Zustand)
- [ ] Implement session handling
- [ ] Add logout functionality

#### 1.4 Design System Setup
- [ ] Extract Figma design tokens
- [ ] Configure Tailwind with design tokens
- [ ] Create base UI components:
  - Button
  - Input
  - Modal
  - Dropdown
  - Card
- [ ] Implement DotsBackground component
- [ ] Build Navbar component
- [ ] Build BottomToolbar component
- [ ] Setup global styles

#### 1.5 Core Layout Structure
- [ ] Create root layout with auth provider
- [ ] Create auth layout (login/signup pages)
- [ ] Create dashboard layout (navbar + modules + toolbar)
- [ ] Implement responsive grid system
- [ ] Add protected route logic

### Deliverables
- ✅ User can sign up with email/password
- ✅ User can sign in with Google OAuth
- ✅ Protected dashboard route with empty modules skeleton
- ✅ Navbar and bottom toolbar matching Figma design
- ✅ Responsive layout foundation

### Success Criteria
- New user can create account and log in
- Session persists across page refreshes
- Unauthorized users redirected to login
- All UI matches Figma pixel-perfectly
- No console errors or warnings

---

## Phase 2: Client Manager + Data Layer (Weeks 3-4)

### Objective
Build first functional module and establish data patterns for all other modules.

### Tasks

#### 2.1 API Abstraction Layer
- [ ] Create repository pattern structure
- [ ] Implement `lib/api/clients.ts`:
  - getClients()
  - getClient(id)
  - createClient(data)
  - updateClient(id, data)
  - deleteClient(id)
- [ ] Add TypeScript types for all entities
- [ ] Implement error handling utilities
- [ ] Add request/response logging (dev mode)

#### 2.2 React Query Setup
- [ ] Install @tanstack/react-query
- [ ] Create QueryClient provider
- [ ] Setup devtools (development only)
- [ ] Create useClients() hook with:
  - Queries: list, detail
  - Mutations: create, update, delete
  - Optimistic updates
  - Cache invalidation strategy

#### 2.3 Client Manager UI
- [ ] Build ClientList component (left sidebar)
- [ ] Build ClientItem component
- [ ] Implement AddClientButton with modal
- [ ] Create ClientForm component
- [ ] Add client search/filter
- [ ] Implement edit client functionality
- [ ] Implement delete client with confirmation
- [ ] Add empty state (no clients yet)
- [ ] Add loading states (skeleton)
- [ ] Add error states

#### 2.4 Client Detail View
- [ ] Create client detail page route
- [ ] Display client information
- [ ] Show related contracts/invoices (future links)
- [ ] Add edit/delete actions
- [ ] Implement breadcrumb navigation

#### 2.5 Testing & Validation
- [ ] Test RLS policies (can't access other users' clients)
- [ ] Test optimistic updates (add/edit/delete)
- [ ] Test error scenarios (network failures)
- [ ] Validate form inputs (required fields)
- [ ] Test responsive design

### Deliverables
- ✅ Fully functional Client Manager module
- ✅ Users can CRUD clients
- ✅ Data persists to Supabase
- ✅ UI matches Figma design exactly
- ✅ Established pattern for other modules

### Success Criteria
- User can add, edit, delete clients
- Client list updates in real-time
- No cross-user data leakage (RLS verified)
- Smooth optimistic updates
- Sub-200ms perceived performance

---

## Phase 3: Time Tracker Module (Weeks 5-6)

### Objective
Implement time tracking with real-time timer functionality and database synchronization.

### Tasks

#### 3.1 Data Layer
- [ ] Create `lib/api/timeLogs.ts` repository
- [ ] Implement time log CRUD operations
- [ ] Add time calculation utilities
- [ ] Create daily/weekly summary queries

#### 3.2 State Management
- [ ] Create timerStore (Zustand) for active timers
- [ ] Implement timer start/stop/pause logic
- [ ] Add background timer sync (every 30s)
- [ ] Handle browser refresh (restore timers from DB)
- [ ] Prevent concurrent timers

#### 3.3 Time Tracker UI
- [ ] Build TimerList component (right sidebar)
- [ ] Build TimerEntry component
- [ ] Implement timer controls (play/pause/stop)
- [ ] Add real-time duration display
- [ ] Build AddTimerButton with modal
- [ ] Create TimerForm (task name, client assignment)
- [ ] Implement TimeSummary component (daily/weekly totals)

#### 3.4 Timer Functionality
- [ ] Client-side ticking with setInterval
- [ ] Periodic DB sync (save duration)
- [ ] Handle pause/resume state
- [ ] Calculate elapsed time accurately
- [ ] Notification for long-running timers (>8 hours)

#### 3.5 Integration
- [ ] Connect to Client Manager (assign time to client)
- [ ] Add time log history view
- [ ] Implement manual time entry
- [ ] Add edit time log functionality

### Deliverables
- ✅ Functional time tracker in right sidebar
- ✅ Users can start/pause/stop timers
- ✅ Daily and weekly summaries display correctly
- ✅ Timers sync across page refreshes

### Success Criteria
- Timer accuracy within 1 second
- No timer data loss on refresh
- Background sync works reliably
- Can run multiple timers (pausing previous)
- UI matches Figma exactly

---

## Phase 4: Contract Generator (Week 7)

### Objective
Build contract generation with form input and PDF export.

### Tasks

#### 4.1 Data Layer
- [ ] Create `lib/api/contracts.ts` repository
- [ ] Implement contract CRUD operations
- [ ] Add contract number generation logic
- [ ] Create contract templates

#### 4.2 PDF Generation Setup
- [ ] Install @react-pdf/renderer
- [ ] Create ContractPDF component
- [ ] Design PDF layout matching professional standards
- [ ] Add company branding
- [ ] Implement font loading (Inter font)

#### 4.3 Contract Generator UI
- [ ] Build ContractForm component (center workspace)
- [ ] Add client selection dropdown
- [ ] Implement form fields:
  - Project description
  - Start/end dates
  - Payment terms
  - Deliverables
  - Total amount
- [ ] Build ContractPreview component
- [ ] Add real-time preview as user types

#### 4.4 Contract Management
- [ ] Implement save draft functionality
- [ ] Add contract list view
- [ ] Create contract detail page
- [ ] Implement edit contract
- [ ] Add delete contract
- [ ] Implement status tracking (draft/active/completed)

#### 4.5 PDF Export
- [ ] Add PDFDownloadLink component
- [ ] Implement download functionality
- [ ] Add "Save to Supabase Storage" option (future)
- [ ] Show generation progress indicator

### Deliverables
- ✅ Contract generator form functional
- ✅ PDF generation works on all browsers
- ✅ Contracts saved to database
- ✅ Professional-looking PDF output

### Success Criteria
- Form validation prevents invalid submissions
- PDF matches professional contract standards
- Download works instantly (<2s)
- Saved contracts accessible from list view
- UI matches Figma design

---

## Phase 5: Invoice Generator (Weeks 8-9)

### Objective
Build invoice generation with line items, calculations, and PDF export.

### Tasks

#### 5.1 Data Layer
- [ ] Create `lib/api/invoices.ts` repository
- [ ] Implement invoice and invoice_items CRUD
- [ ] Add invoice number auto-increment logic
- [ ] Create calculation utilities (subtotal, tax, total)

#### 5.2 Invoice Form UI
- [ ] Build InvoiceForm component (center workspace)
- [ ] Add client selection
- [ ] Implement invoice metadata fields:
  - Invoice number (auto-generated)
  - Issue date, due date
  - Notes, terms
- [ ] Build InvoiceItems component
- [ ] Add line item CRUD (add/remove rows)
- [ ] Implement real-time calculations
- [ ] Add tax rate input

#### 5.3 PDF Generation
- [ ] Create InvoicePDF component
- [ ] Design professional invoice layout
- [ ] Add company branding
- [ ] Include payment instructions
- [ ] Add tax breakdown
- [ ] Implement footer with terms

#### 5.4 Invoice Management
- [ ] Create invoice list view
- [ ] Implement status tracking (draft/sent/paid/overdue)
- [ ] Add invoice detail page
- [ ] Implement edit invoice
- [ ] Add delete invoice
- [ ] Build "Mark as Paid" functionality

#### 5.5 Advanced Features
- [ ] Duplicate invoice functionality
- [ ] Invoice preview before download
- [ ] Calculate due date automatically (30 days default)
- [ ] Add currency selector

### Deliverables
- ✅ Invoice generator fully functional
- ✅ Line items dynamically add/remove
- ✅ Calculations accurate with tax
- ✅ Professional PDF invoices

### Success Criteria
- Calculations update in real-time
- No duplicate invoice numbers
- PDF meets professional standards
- Status tracking works correctly
- Optimistic updates for line items

---

## Phase 6: Income Tracker (Week 10)

### Objective
Build income overview dashboard with expected vs. actual tracking.

### Tasks

#### 6.1 Data Aggregation
- [ ] Create income calculation queries
- [ ] Implement expected income (from contracts)
- [ ] Implement actual income (from paid invoices)
- [ ] Add monthly filtering
- [ ] Create year-over-year comparison (future)

#### 6.2 Income Tracker UI
- [ ] Build IncomeOverview component
- [ ] Display expected vs. actual amounts
- [ ] Add progress indicator (percentage)
- [ ] Implement month selector
- [ ] Create simple bar chart/visualization
- [ ] Add summary cards (total invoices, paid, pending)

#### 6.3 Integration
- [ ] Connect to invoices data
- [ ] Connect to contracts data
- [ ] Real-time updates when invoice marked paid
- [ ] Add filter by client

### Deliverables
- ✅ Income tracker displays accurate data
- ✅ Monthly overview functional
- ✅ Expected vs. actual calculations correct

### Success Criteria
- Numbers match invoice/contract totals
- Updates immediately when invoice paid
- Simple, clear visualization
- No heavy charting library (keep bundle small)

---

## Phase 7: Module Integration (Week 11)

### Objective
Connect all modules together and implement cross-module features.

### Tasks

#### 7.1 Workspace Switching
- [ ] Implement bottom toolbar module switching
- [ ] Add active module state (Zustand)
- [ ] Smooth transitions between modules
- [ ] Preserve module state when switching

#### 7.2 Cross-Module Features
- [ ] Client filtering across modules
- [ ] Time logs → Invoice conversion (future prep)
- [ ] Contract → Invoice templates
- [ ] Global search across all entities

#### 7.3 Dashboard Enhancements
- [ ] Add quick stats to dashboard
- [ ] Recent items widget
- [ ] Notifications system (future prep)
- [ ] Activity feed (recent contracts, invoices, time logs)

#### 7.4 Data Export
- [ ] Export time logs to CSV
- [ ] Export invoices to CSV
- [ ] Batch operations (delete multiple items)

### Deliverables
- ✅ Seamless navigation between modules
- ✅ Cross-module relationships working
- ✅ Enhanced dashboard with widgets

---

## Phase 8: Polish & Production Hardening (Week 12)

### Objective
Prepare application for production launch with testing, optimization, and deployment.

### Tasks

#### 8.1 UI/UX Polish
- [ ] Pixel-perfect Figma matching audit
- [ ] Add animations/transitions (subtle)
- [ ] Implement empty states for all modules
- [ ] Add loading skeletons (not spinners)
- [ ] Improve error messages (user-friendly)
- [ ] Responsive design testing (mobile, tablet)
- [ ] Dark mode support (future consideration)

#### 8.2 Performance Optimization
- [ ] Code splitting (lazy load PDF generator)
- [ ] Optimize images/SVGs from Figma
- [ ] Bundle size analysis (@next/bundle-analyzer)
- [ ] React Query cache tuning
- [ ] Database query optimization
- [ ] Add loading performance metrics

#### 8.3 Security Audit
- [ ] RLS policy testing (automated tests)
- [ ] Input validation (client + server)
- [ ] XSS prevention audit
- [ ] Rate limiting configuration
- [ ] Environment variable security check
- [ ] OWASP Top 10 review

#### 8.4 Testing
- [ ] E2E tests (Playwright):
  - User signup/login flow
  - Create client → contract → invoice flow
  - Time tracking flow
- [ ] Integration tests:
  - API layer + Supabase
  - Auth flows
- [ ] Unit tests:
  - Calculation utilities
  - Form validators
  - Time duration utilities

#### 8.5 Documentation
- [ ] Update README.md
- [ ] Create .env.example
- [ ] Database schema documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] User guide (basic)

#### 8.6 Deployment
- [ ] Create Vercel project
- [ ] Setup production Supabase project
- [ ] Configure environment variables
- [ ] Database migration to production
- [ ] Custom domain + SSL
- [ ] Setup Vercel Analytics
- [ ] Setup error tracking (Sentry)
- [ ] Configure monitoring/alerts

### Deliverables
- ✅ Production-ready application
- ✅ All tests passing
- ✅ Deployed to production
- ✅ Monitoring and error tracking active

### Success Criteria
- Lighthouse score >90
- No critical security vulnerabilities
- E2E tests cover critical paths
- Zero console errors
- Deployed and accessible via custom domain

---

## Technical Specifications

### Database Schema

**See detailed schema in architecture plan. Key tables:**
- profiles
- clients
- contracts
- invoices
- invoice_items
- time_logs

**RLS enabled on all tables with user_id isolation.**

### API Structure

**Repository Pattern:**
```
lib/api/
├── clients.ts
├── contracts.ts
├── invoices.ts
├── timeLogs.ts
└── profiles.ts
```

**Each repository provides:**
- Type-safe CRUD methods
- Error handling
- Consistent response format

### State Management

**React Query:** Server state (database data)
**Zustand:** Global UI state (active module, auth, running timers)
**useState:** Local component state

### Routes

```
/ - Landing page
/login - Login page
/signup - Signup page
/dashboard - Main workspace
/clients - Client list (future)
/clients/[id] - Client detail
/contracts/[id] - Contract detail
/invoices/[id] - Invoice detail
/time - Time logs (future)
```

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## Risk Mitigation

### Performance Risks
- **Risk:** Large bundle size
- **Mitigation:** Code splitting, dynamic imports, bundle analysis

### Security Risks
- **Risk:** RLS misconfiguration
- **Mitigation:** Automated testing, manual audit, monitoring

### Scalability Risks
- **Risk:** Database performance degradation
- **Mitigation:** Proper indexing, query monitoring, connection pooling

---

## Post-Launch Roadmap

### Phase 9: Enhancements (Months 2-3)
- Apple OAuth (if not in MVP)
- Enhanced time tracker (categories, tags)
- Recurring invoices
- Email notifications
- Invoice payment links (Stripe integration)
- Contract templates library
- Mobile responsive improvements

### Phase 10: Advanced Features (Months 4-6)
- E-signature integration
- Team collaboration (multi-user workspaces)
- Advanced analytics dashboard
- Automated invoice reminders
- Time logs → Invoice automation
- White-label branding
- API for integrations

---

## Success Metrics

**Week 2:** Core infrastructure complete, auth working
**Week 4:** Client Manager operational
**Week 6:** Time Tracker operational  
**Week 7:** Contract Generator operational
**Week 9:** Invoice Generator operational
**Week 10:** Income Tracker operational
**Week 12:** Production launch

**Launch KPIs:**
- User signup conversion >30%
- Time to first invoice <5 minutes
- PDF generation success rate >99%
- Page load time <2 seconds
- Zero critical security issues

---

## Conclusion

This implementation plan provides a clear roadmap for building Stacklite as a production-ready SaaS application. Each phase builds on the previous, with clear deliverables and success criteria. The 12-week timeline is realistic for a focused development effort with proper planning and execution.

**Next Steps:**
1. Setup development environment
2. Create Supabase project
3. Initialize Next.js project
4. Begin Phase 1 implementation

---

**Document Version History:**
- v1.0 (Feb 12, 2026) - Initial implementation plan created
