# CLAUDE.md — Reading Trove

## Project overview

Reading Trove is a personal book tracking app. Two views:
- **Library** (`/`) — read books, stats, ratings, genre filtering
- **TBR** (`/tbr`) — To Be Read list with GSAP 3D card hover animations

Single-owner model: all data belongs to one hardcoded user (`OWNER_UUID` in `lib/supabase.js`). Visitors can browse in read-only mode; the owner unlocks write access via a lock toggle in the UI.

## Stack

- **Next.js 15** App Router, React 19 (all client components — no RSC data fetching)
- **Supabase** — two tables: `books` (read), `tbr_books` (to-be-read)
- **GSAP** — 3D book hover effect on TBR cards (see `useLayoutEffect` in `TBRTracker.jsx`)
- **Vercel** — hosting + analytics (`@vercel/analytics`)
- **Agentation** — design annotation toolbar, dev-only (`process.env.NODE_ENV === 'development'`)
- **Claude API** — proxied via `app/api/claude/route.js` using `claude-sonnet-4-6`

## Key files

| File | Purpose |
|------|---------|
| `components/BookTracker.jsx` | Main library view — read books, stats, add/complete/delete |
| `components/TBRTracker.jsx` | TBR view — want-to-read list with undo-delete and confirmation modal |
| `components/AddBookDrawer.jsx` | Slide-in drawer for adding a new book |
| `components/ui/` | Shared primitives: Button, StarRating, GenreBadge, StatCard, etc. |
| `app/globals.css` | All styles + design tokens (single CSS file, no CSS modules) |
| `lib/supabase.js` | Supabase client + `OWNER_UUID` constant |
| `app/api/claude/route.js` | Claude API proxy (requires `ANTHROPIC_API_KEY` env var) |
| `.github/workflows/ci.yml` | CI: Next.js build + Storybook build on every PR to main |

## Design system

All tokens live in `:root` in `app/globals.css`. Key ones:

```css
--bg, --surface, --surface-2       /* backgrounds */
--text, --text-muted, --text-subtle /* typography */
--border, --border-strong
--spacing-1: 4px  --spacing-2: 8px  --spacing-3: 12px  --spacing-4: 16px
--font-sans   /* Plus Jakarta Sans */
--font-heading /* Crimson Text */
```

Dark mode uses the `html.dark` class (toggled via `localStorage` key `rt_theme`). A flash-prevention script in `app/layout.jsx` sets the class before hydration.

CSS class conventions:
- `bd-*` — book detail drawer elements (`bd-synopsis`, `bd-author`, `bd-title`)
- `bd-synopsis--muted` — muted color modifier for synopsis text
- `book-card-select-btn` — stretched semantic button inside TBR card (z-index: 1, behind interactive controls at z-index: 20)

## GSAP animations

TBR book cards have a 3D open-book hover effect. Setup lives in a `useLayoutEffect` in `TBRTracker.jsx` that reruns on `[books]`. Important:
- Always check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before setting up — skip all animations if true
- Timelines are stored in `gsapTimelinesRef` and killed in cleanup; the effect tears down and rebuilds on every books update
- GSAP selects cards via `.tbr-book-card[data-book-id]` — keep these attributes on the outer div

## Supabase schema (known columns)

**`books`**: `id`, `user_id`, `title`, `author`, `genre`, `rating`, `cover_image`, `synopsis`, `date_completed`

**`tbr_books`**: `id`, `user_id`, `title`, `author`, `genre`, `rating`, `cover_image`, `synopsis`

Cover images are stored as base64 strings, compressed client-side via a canvas utility in `BookTracker.jsx` (max 200×300px, 0.7 JPEG quality).

## Environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `ANTHROPIC_API_KEY` | Yes | Used in `app/api/claude/route.js` |
| `NEXT_PUBLIC_SUPABASE_URL` | CI only | Hardcoded in `lib/supabase.js` for runtime; needed as GitHub Actions secret for build check |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | CI only | Same as above |

## Development workflow

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run lint       # ESLint (next lint)
npm run storybook  # Storybook on :6006
```

CI runs on every PR to `main` via GitHub Actions: Next.js build + Storybook build.

## Claude Code skills

`/commit-push-pr` — stages changes, commits, pushes, opens PR, watches CI, then runs a code review and posts findings as PR comments. Use this instead of manual git commands.
