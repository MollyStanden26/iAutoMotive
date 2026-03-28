# AutoConsign — Claude Code Project Context

## What is this project?
AutoConsign is a UK-based consignment car platform. This repo contains the full-stack Next.js 14 application covering 5 surfaces: marketing site, admin dashboard, seller portal, buyer portal, and dealer portal.

## Key references
- `AGENTS.md` — Code style, component rules, animation rules, agent workflow
- `TARGET.md` — Clone target configuration (currently: Carvana homepage)
- `src/styles/globals.css` — All design tokens (CSS custom properties)
- `tailwind.config.ts` — Tailwind theme with AutoConsign colour palette
- `src/types/` — TypeScript interfaces for all domain entities

## Brand Identity
- Primary colour: Vivid Teal (#008C7C)
- Headings: Plus Jakarta Sans (300/400/600/700/800)
- Body: Inter (400/500/600/700)
- Card radius: 20px, Button radius: 100px (pill), Input radius: 12px

## Agent Teams
When launching Claude Code agent teams, ALWAYS have each teammate work in their own worktree branch and merge everyone's work at the end.
