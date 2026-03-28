# Agent Instructions — AutoConsign

## Code Style & Standards
- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript strict
- **Styling**: Tailwind CSS v3 with custom design tokens from `tailwind.config.ts`
- **Fonts**: Plus Jakarta Sans (headings, `font-heading`) + Inter (body, `font-body`) via `next/font/google`
- **Icons**: Lucide React as default; extract SVGs from target during cloning
- **Path alias**: `@/*` maps to `./src/*`

## Component Rules
- All components go in `src/components/` under the appropriate subdirectory
- Use CSS custom properties from `src/styles/globals.css` for all design tokens
- Never hardcode hex values — use Tailwind classes or CSS variables
- Every `<input>` must have explicit `background-color: #FFFFFF` and `color: #374151`
- Border radii: inputs 12px, search bars 14px, cards 20px, stats 16px, modals 24px, buttons/badges 100px (pill)
- All hover transitions: 200ms cubic-bezier(.25,.46,.45,.94) for cards, 150ms ease for buttons/links

## Animation Rules
- Scroll reveals use IntersectionObserver at threshold 0.15
- Default scroll animation: fade-up (opacity 0→1, translateY 24px→0, 500ms)
- Grid stagger: 100ms per column, capped at 400ms
- All animations wrapped in `@media (prefers-reduced-motion: no-preference)`
- Only animate `opacity` and `transform` — never layout properties

## Agent Workflow
- When launching builder agents, each works in their own git worktree branch
- Builder agents receive full inline specs — never references to files
- Each agent's output must pass `npm run build` before merging
- Merge all worktree branches back to main when complete

## File Naming
- Components: PascalCase (`VehicleCard.tsx`) or kebab-case (`vehicle-card.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Utilities: kebab-case (`net-sheet.ts`)
- Types: kebab-case (`vehicle.ts`)
