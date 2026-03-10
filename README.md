# Readful

A calm, minimal news reader. Read what matters, dismiss the rest.

Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Setup

### 1. Get your API keys

**NewsAPI** (free) — [https://newsapi.org/register](https://newsapi.org/register)

**New York Times API** (free) — [https://developer.nytimes.com](https://developer.nytimes.com) → create an app and enable the Top Stories API.

### 2. Add your API keys

Create a `.env.local` file in the project root:

```env
NEWS_API_KEY=your_newsapi_key_here
NYT_API_KEY=your_nyt_key_here
```

Both keys are used server-side only — they are never exposed to the browser.

### 3. Install dependencies

```bash
npm install
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

- **Article images** — thumbnail photos from each article, with graceful fallback for missing images
- **Categories** — All, NYT, Football, Channels, AI, Science, Business, Health, Politics, Climate, Food
- **Sub-filters** — a second filter row that appears contextually:
  - **NYT** — Top Stories, World, US, Politics, Technology, Science, Health, Business, Sports, Food, Arts, Opinion
  - **Football** — All Clubs, Barcelona, Real Madrid, Man City, Arsenal, Liverpool, Chelsea, PSG, Bayern, Juventus, Inter Milan, AC Milan, Atlético, Dortmund
  - **Channels** — Al Jazeera, BBC News, Reuters, The Guardian, AP, CNN, Sky News, BBC Sport, ESPN, Sky Sports, talkSPORT
- **Dismiss** — hide articles you've seen (persisted in localStorage)
- **Daily cap** — max 20 articles shown at once
- **Skeleton loading** — smooth loading state while fetching
- **Mobile responsive** — works on all screen sizes
- **Persistent category** — last selected category is remembered across sessions

## Project structure

```
src/
  app/
    api/
      news/route.ts     # NewsAPI proxy (all categories except NYT)
      nyt/route.ts      # New York Times Top Stories proxy
    globals.css
    layout.tsx
    page.tsx            # Main feed page
  components/
    ArticleCard.tsx     # Individual article card with image
    CategoryFilter.tsx  # Main category bar
    SubFilter.tsx       # Contextual sub-filter row
```

## Deployment (Netlify)

Add both environment variables in **Site settings → Environment variables**:

```
NEWS_API_KEY=...
NYT_API_KEY=...
```

The `netlify.toml` and `@netlify/plugin-nextjs` are already configured.

## Notes

- The free NewsAPI plan only works on `localhost`. For production, you need to upgrade to a Developer plan ($449/mo) or use the NYT and Channels tabs which work without restrictions.
- Responses are cached for 5 minutes via Next.js fetch cache.
- Dismissed articles are stored by URL in `localStorage` and persist across sessions.
