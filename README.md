# Reading Trove

A personal book tracking app to log what you've read and what you want to read next.

## Features

- **Library** — track books you've read with ratings, genres, cover art, and synopses
- **TBR list** — maintain a To Be Read shelf with an animated 3D card effect
- **Reading stats** — books per year, genre breakdown, average rating
- **Dark mode** — warm parchment light theme and a soft dark mode
- **Cover art** — upload or paste a cover image, compressed automatically
- **Undo delete** — accidental deletions can be undone within 5 seconds
- **Guest view** — share your shelf publicly in read-only mode; unlock to edit

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, GSAP |
| Database | Supabase (PostgreSQL) |
| Fonts | Plus Jakarta Sans, Crimson Text |
| Hosting | Vercel |
| Analytics | Vercel Analytics |

## Getting started

```bash
git clone https://github.com/IpshitaChatterjee/book-tracker.git
cd book-tracker
npm install
```

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.jsx           # Library view
  tbr/page.jsx       # TBR (To Be Read) view
  api/claude/        # Claude API proxy
  globals.css        # All styles and design tokens
components/
  BookTracker.jsx    # Main library component
  TBRTracker.jsx     # TBR list component
  ui/                # Shared UI primitives
lib/
  supabase.js        # Supabase client
```

## CI

Pull requests to `main` run two GitHub Actions checks:
- **Next.js Build** — verifies the production build succeeds
- **Storybook Build** — verifies the component stories build cleanly

## Deployment

Deployed on Vercel. Add `ANTHROPIC_API_KEY` to your Vercel project's environment variables for the AI features to work.
