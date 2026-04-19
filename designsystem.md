# Stacklite Design System

This is the implementation contract for Stacklite UI: foundations, styles, token system, typography, components, interaction behavior, accessibility, and governance.

## 1. Purpose and Scope

1. Keep UI consistent across all modules and routes.
2. Enforce token-driven styling and eliminate ad-hoc color usage.
3. Preserve accessibility and usability standards at component level.
4. Provide one source of truth for design decisions in code.

In scope:

1. Foundations and visual language.
2. Token architecture and semantic naming.
3. Typography and spacing.
4. Primitive and composed components.
5. States, interactions, motion, and feedback.
6. Engineering rules and merge checklist.

## 2. Foundations

### 2.1 Design Principles

1. Clarity first: interfaces should be legible and predictable.
2. Token first: style decisions must resolve through semantic tokens.
3. Reuse first: shared primitives before custom one-off UI.
4. Accessible by default: keyboard, focus, labels, and semantics are mandatory.
5. Stateful correctness: default, hover, focus, active, disabled, and error states must all be explicit.

### 2.2 System Layers

1. CSS custom properties in app/globals.css define source tokens.
2. Tailwind aliases in tailwind.config.ts expose semantic utility names.
3. Primitives in components/ui implement reusable behavior.
4. Product modules in components/modules compose primitives for business flows.

## 3. Style Rules (Non-Negotiable)

1. Never use raw hex classes in component markup.
2. Never use Tailwind default palette classes for product UI colors.
3. Always use semantic Lumea token utilities.
4. Do not delete or rename existing token mappings in tailwind.config.ts.
5. Do not alter token variables in app/globals.css without explicit approval.

## 4. Token System

### 4.1 Token Categories

Token namespaces available in Tailwind config:

1. Canvas and page: page, canvas, dot.
2. Surface and background: surface.*, background.*.
3. Typography and borders: text.*, border.*.
4. Brand and links: brand.*, link.*.
5. Buttons: button.*, btn.*.
6. Feedback: feedback.*.
7. Specialized UI: icon.*, topbar.*, module.*, dock.*, step.*, badge.*, preview.*.
8. Layout scale: spacing tokens xs through 4xl.
9. Shape and depth: radius tokens sm through xl, shadow tokens sm through lg.
10. Focus: ringColor.brand.

### 4.2 Semantic Utility Reference

Primary color usage patterns:

1. Page and shells:
   - bg-page
   - bg-canvas
   - bg-background-base
   - bg-background-highlight
   - bg-background-muted
2. Text:
   - text-text-base
   - text-text-body
   - text-text-muted
   - text-text-placeholder
   - text-text-disabled
   - text-text-brand
3. Borders:
   - border-border-base
   - border-border-muted
   - border-border-input
   - border-border-disabled
   - border-border-brand
4. Actions:
   - bg-button-primary text-button-primary-fg
   - bg-button-secondary text-button-secondary-fg
   - text-button-ghost-fg
5. Feedback:
   - text-feedback-error-text
   - text-feedback-success-text
   - text-feedback-warning-text
   - text-feedback-info-text

### 4.3 Spatial Token Scale

Spacing aliases map to CSS vars:

1. xs
2. sm
3. md
4. lg
5. xl
6. 2xl
7. 3xl
8. 4xl

Guidance:

1. Use consistent spacing rhythm based on 4px increments.
2. Prefer tokenized spacing aliases when authoring reusable primitives.

### 4.4 Shape and Elevation Tokens

Radius:

1. rounded-sm for tight controls.
2. rounded-md for inputs/selects/textarea.
3. rounded-lg for buttons.
4. rounded-xl for cards and panels.

Shadows:

1. shadow-sm for inline fields and lightweight surfaces.
2. shadow-md for standard card elevation.
3. shadow-lg for modal and floating content.

### 4.5 Focus Ring Contract

Every interactive control must expose clear keyboard focus:

1. focus-visible:ring-2.
2. focus-visible:ring-text-brand or equivalent semantic ring token.
3. Appropriate ring offset on layered surfaces.

## 5. Theming

1. Light theme tokens are defined in :root.
2. Dark theme tokens are defined in .dark.
3. Components should consume semantic utilities and avoid hardcoding per-theme values.
4. Feedback semantics and interaction states must remain recognizable in both themes.

## 6. Typography System

### 6.1 Font Stack

1. UI font is tokenized through --font-sans.
2. Current implementation ships Satoshi as the primary face in app/globals.css.
3. Tailwind font family mapping resolves to fontFamily.sans in tailwind.config.ts.

### 6.2 Type Roles

Use role-based styles, not arbitrary text sizes:

1. Page title: prominent, semibold, high contrast.
2. Section heading: concise and stable across modules.
3. Body: readable line length and moderate contrast.
4. Helper/meta: subdued with text-text-muted.
5. Labels and errors: compact, context bound, and readable.

### 6.3 Numeric Content

For amounts, durations, and identifiers:

1. Align values consistently in tables/lists.
2. Preserve predictable digit width where necessary.
3. Keep status and value separation visually clear.

## 7. Layout and Visual Style Primitives

### 7.1 Global Utility Styles

Available global style classes include:

1. canvas-grid, dots-background.
2. theme-page-shell.
3. theme-shell-card, theme-shell-panel.
4. theme-shell-divider, theme-shell-chip, theme-shell-chip-strong.
5. theme-shell-muted, theme-shell-subtle, theme-shell-strong.
6. theme-shell-field.
7. theme-scrollbar.

### 7.2 Workspace Shell Components

Workspace-level composition components:

1. components/workspace/Canvas.tsx.
2. components/workspace/ModuleCard.tsx.
3. components/workspace/Dock.tsx.
4. components/workspace/Navbar.tsx.

Layout/support components:

1. components/layout/AppNavbar.tsx.
2. components/layout/GuestIndicator.tsx.
3. components/layout/SavePromptModal.tsx.
4. components/layout/SignInButton.tsx.

## 8. Motion and Transition System

### 8.1 Standard Motion Tokens

Provided classes:

1. animate-fade-in and animate-fadeIn.
2. animate-slide-in and animate-slideIn.
3. skeleton shimmer loading state.

### 8.2 Motion Rules

1. Use motion to indicate state change, not decorative noise.
2. Keep durations subtle and brief.
3. Avoid combining multiple animations on one element unless required.
4. Loading placeholders must not misrepresent final layout.

## 9. Component Library

Core primitives from components/ui:

1. Button, IconButton.
2. Input, InputWrapper.
3. Select.
4. Textarea.
5. Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
6. Modal.
7. DatePicker.
8. Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownGroup, DropdownLabel, DropdownDivider, DropdownShortcut.
9. Badge, BadgeDot.
10. TooltipProvider, Tooltip, TooltipTrigger, TooltipContent.
11. Avatar, AvatarImage, AvatarFallback.

### 9.1 Button Contract

Variants:

1. primary.
2. secondary.
3. ghost.
4. outline.
5. danger.

Sizes:

1. sm.
2. md.
3. lg.

Behavior:

1. Button supports isLoading and asChild.
2. IconButton requires accessible label prop.
3. Disabled and loading states must be visually distinct.

### 9.2 Input Contract

Shared conventions across Input, Select, Textarea, DatePicker:

1. Accept optional label, error, and hint text.
2. Required fields must show required indicator.
3. Error state overrides focus styling with error tokens.
4. Disabled state must use disabled tokens.

### 9.3 Card Contract

1. Card supports clickable mode for interactive containers.
2. Card subcomponents define spacing hierarchy.
3. Card focus styling must remain keyboard visible.

### 9.4 Modal Contract

1. Modal sizes: sm, md, lg, xl.
2. Must include title and close affordance.
3. Overlay + content layers require strong contrast and focus handling.

### 9.5 Dropdown and Tooltip Contract

1. Dropdown content uses semantic surface, border, and text tokens.
2. Disabled items must be visually and behaviorally non-interactive.
3. Tooltip content must be concise and accessible.
4. Tooltip is required for icon-only buttons in dense UI contexts.

### 9.6 Badge Contract

Badge variants:

1. soft.
2. outline.
3. strong.

Badge tones:

1. neutral.
2. primary.
3. success.
4. warning.
5. danger.
6. info.

## 10. Module Composition Guidelines

Modules currently:

1. ClientManager.
2. TimeTracker.
3. ContractGenerator.
4. InvoiceGenerator.
5. IncomeTracker.

Rules:

1. Reuse primitives from components/ui before creating module-specific controls.
2. Keep visual rhythm consistent across all modules.
3. Every module must include empty, loading, error, and success states where applicable.
4. Destructive actions require explicit confirmation UI.

## 11. State and Interaction Patterns

All interactive components must define and visually support:

1. Default.
2. Hover.
3. Focus-visible.
4. Active/pressed.
5. Disabled.
6. Error.
7. Success.
8. Warning.

No component may ship with partial state coverage.

## 12. Accessibility Standards

1. Keyboard navigation must be complete for all interactive controls.
2. Focus ring must be visible on every control and variant.
3. Icon-only controls need aria-label and tooltip.
4. Inputs/selects/textarea/date pickers must have labels.
5. Color cannot be the only channel for meaning.
6. Error messages should be adjacent and understandable.
7. Dialogs and dropdowns must maintain correct focus behavior.

## 13. Content and Language Standards

1. Use concise action-oriented labels.
2. Use sentence case in helper and error text.
3. Avoid vague errors; provide next-step guidance.
4. Keep status language consistent across modules.

## 14. Engineering Rules

1. Keep business logic outside presentational primitives.
2. Avoid inline styles for design-system behavior.
3. Avoid duplicate style systems.
4. Keep component APIs stable; evolve via additive changes when possible.
5. Maintain strict TypeScript typing for all reusable components.

## 15. Governance and Change Management

When updating the design system:

1. Define why the change is needed.
2. Update token source and Tailwind mapping consistently.
3. Update this document with behavior and usage changes.
4. Update affected primitives before module-level overrides.
5. Validate light and dark themes.
6. Run lint, type-check, and relevant tests.

## 16. Pre-Merge Checklist

1. No raw hex or default Tailwind color classes in component markup.
2. Semantic tokens used for all color decisions.
3. Labels, hints, and errors implemented for form controls.
4. Focus-visible styles verified for keyboard navigation.
5. Empty/loading/error states present.
6. Reused shared primitives where applicable.
7. Verified in light and dark theme.
8. Verified on mobile and desktop breakpoints.

## 17. Quick Usage Examples

Primary call-to-action:

```tsx
<Button variant="primary">Save</Button>
```

Secondary action:

```tsx
<Button variant="secondary">Cancel</Button>
```

Labeled input with hint:

```tsx
<Input label="Client name" hint="Use legal entity name" required />
```

Error state in form field:

```tsx
<Textarea label="Scope" error="Scope is required" />
```

Semantic card scaffold:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Invoice Summary</CardTitle>
    <CardDescription>Current billing period</CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

## 18. Source of Truth

1. Token variables: app/globals.css.
2. Tailwind mappings: tailwind.config.ts.
3. Primitive components: components/ui.
4. Workspace shell components: components/workspace.
5. Module composition: components/modules.

If there is conflict between implementation and documentation, align implementation back to tokenized foundations and then update this document if behavior intentionally changed.
