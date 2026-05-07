# Sydney Cup 3.0

Doubles Tennis Championship website — built with Next.js 14 + TypeScript, ready for Vercel.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (no external UI library)
- **Fonts**: Cinzel · Cormorant Garamond · Raleway (Google Fonts)
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
sydney-cup/
├── app/
│   ├── layout.tsx              # Root layout & metadata
│   ├── page.tsx                # Home — countdown page
│   ├── page.module.css
│   ├── globals.css             # CSS variables & global styles
│   ├── competition/
│   │   └── page.tsx            # Competition details page
│   └── events/
│       ├── sydney-cup-1/       # Past edition 1
│       └── sydney-cup-2/       # Past edition 2
├── components/
│   ├── Countdown.tsx           # Live countdown timer
│   ├── Countdown.module.css
│   ├── Navigation.tsx          # Top nav with past events dropdown
│   ├── Navigation.module.css
│   ├── EventPage.tsx           # Reusable past-event template
│   └── event.module.css
└── public/
```

## Adding Future Past Events

1. Add an entry to `PAST_EVENTS` in `components/Navigation.tsx`:
   ```ts
   { label: "Sydney Cup 4.0", href: "/events/sydney-cup-4" }
   ```
2. Create `app/events/sydney-cup-4/page.tsx`:
   ```tsx
   import EventPage from "@/components/EventPage";
   export default function SydneyCup4() {
     return <EventPage edition="4.0" year="2027" />;
   }
   ```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import the repository — Vercel auto-detects Next.js
4. Click **Deploy** — no configuration needed

## Design

- **Colors**: Navy (`#0a1628`) · Gold (`#c9a84c`) · Cream (`#faf8f2`)
- **Fonts**: Cinzel (display) · Cormorant Garamond (body) · Raleway (UI)
- **Countdown target**: August 2, 2026 · 8:00 AM (edit in `app/page.tsx`)
