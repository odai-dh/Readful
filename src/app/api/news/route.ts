import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://newsapi.org/v2';

function buildUrl(category: string, sub: string): string {
  const key = process.env.NEWS_API_KEY;
  if (!key) throw new Error('NEWS_API_KEY is not configured in .env.local');

  switch (category) {
    case 'Football':
      if (sub) {
        return `${BASE}/everything?q="${encodeURIComponent(sub)}"+football&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
      }
      return `${BASE}/everything?q=football+soccer+UEFA+"Premier+League"+"Champions+League"+"La+Liga"+"Serie+A"+"Bundesliga"&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
    case 'Channels':
      return `${BASE}/top-headlines?sources=${sub || 'al-jazeera-english'}&pageSize=40&apiKey=${key}`;
    case 'AI':
      return `${BASE}/everything?q="artificial+intelligence"+OR+ChatGPT+OR+"machine+learning"+OR+"large+language+model"&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
    case 'Science':
      return `${BASE}/top-headlines?category=science&pageSize=40&language=en&apiKey=${key}`;
    case 'Business':
      return `${BASE}/top-headlines?category=business&country=us&pageSize=40&apiKey=${key}`;
    case 'Health':
      return `${BASE}/top-headlines?category=health&country=us&pageSize=40&apiKey=${key}`;
    case 'Politics':
      return `${BASE}/everything?q=politics+OR+government+OR+election+OR+"White+House"+OR+Congress+OR+Parliament&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
    case 'Climate':
      return `${BASE}/everything?q="climate+change"+OR+environment+OR+"global+warming"+OR+"carbon+emissions"&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
    case 'Food':
      return `${BASE}/everything?q=food&sortBy=publishedAt&pageSize=40&language=en&apiKey=${key}`;
    default:
      return `${BASE}/top-headlines?country=us&pageSize=40&apiKey=${key}`;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const sub = searchParams.get('sub') || '';

  try {
    const url = buildUrl(category, sub);
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    const data = await res.json();

    type RawArticle = { title?: string; url?: string; source: { name: string }; publishedAt: string; description: string | null; urlToImage?: string | null };

    // Filter, deduplicate by URL, and map
    const seen = new Set<string>();
    const articles = (data.articles ?? [])
      .filter((a: RawArticle) =>
        a.title &&
        a.title !== '[Removed]' &&
        a.url &&
        !a.url.includes('removed')
      )
      .filter((a: RawArticle) => {
        if (seen.has(a.url!)) return false;
        seen.add(a.url!);
        return true;
      })
      .map((a: RawArticle) => ({
        title: a.title,
        source: a.source,
        publishedAt: a.publishedAt,
        description: a.description,
        url: a.url,
        urlToImage: a.urlToImage ?? null,
      }));

    return NextResponse.json({ articles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
