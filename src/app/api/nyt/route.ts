import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://api.nytimes.com/svc/topstories/v2';

const SECTION_MAP: Record<string, string> = {
  Home:       'home',
  World:      'world',
  US:         'us',
  Politics:   'politics',
  Technology: 'technology',
  Science:    'science',
  Health:     'health',
  Business:   'business',
  Sports:     'sports',
  Food:       'food',
  Arts:       'arts',
  Opinion:    'opinion',
};

type NytMultimedia = { url: string; format: string };
type NytArticle = {
  title: string;
  abstract: string;
  url: string;
  published_date: string;
  multimedia: NytMultimedia[] | null;
};

export async function GET(request: NextRequest) {
  const key = process.env.NYT_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'NYT_API_KEY is not configured in .env.local' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const sub = searchParams.get('sub') || 'Home';
  const section = SECTION_MAP[sub] ?? 'home';

  try {
    const res = await fetch(`${BASE}/${section}.json?api-key=${key}`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.fault?.faultstring ?? 'NYT API error' }, { status: res.status });
    }

    const data = await res.json();

    const seen = new Set<string>();
    const articles = (data.results ?? [])
      .filter((a: NytArticle) => a.title && a.url)
      .filter((a: NytArticle) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      })
      .map((a: NytArticle) => {
        const img =
          a.multimedia?.find((m) => m.format === 'mediumThreeByTwo440') ??
          a.multimedia?.find((m) => m.format === 'mediumThreeByTwo210') ??
          a.multimedia?.[0] ??
          null;

        return {
          title: a.title,
          source: { name: 'The New York Times' },
          publishedAt: a.published_date,
          description: a.abstract || null,
          url: a.url,
          urlToImage: img?.url ?? null,
        };
      });

    return NextResponse.json({ articles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
