# Readful

A calm, minimal news reader. Read what matters, dismiss the rest.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. Fetches live headlines from [NewsAPI.org](https://newsapi.org).

## Setup

### 1. Get a free NewsAPI key

Go to [https://newsapi.org/register](https://newsapi.org/register) and create a free account. Copy your API key.

### 2. Add your API key

Open `.env.local` in the project root and replace the placeholder:

```env
NEWS_API_KEY=your_actual_key_here
```

> The key is only used server-side in the `/api/news` route — it is never exposed to the browser.

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

- **Category filter** — All, Tech, World, Food, Sports (persisted in localStorage)
- **Article cards** — headline, source, time published, description, and a "Read article" link
- **Dismiss** — hide articles you've seen (persisted in localStorage)
- **Daily cap** — max 20 articles shown at once with a message when the limit is hit
- **Skeleton loading** — smooth loading state while fetching
- **Mobile responsive** — works on all screen sizes

## Project structure

```
src/
  app/
    api/news/route.ts   # Server-side NewsAPI proxy
    globals.css
    layout.tsx
    page.tsx            # Main feed page
  components/
    ArticleCard.tsx
    CategoryFilter.tsx
```

## Notes

- The free NewsAPI plan only works on `localhost`. For production, upgrade to a paid plan.
- Articles are re-fetched every time you switch categories. Responses are cached for 5 minutes via Next.js fetch cache.
- Dismissed articles are stored by URL in `localStorage` and persist across sessions.
