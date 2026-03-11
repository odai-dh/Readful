import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

const SOURCES: Record<string, { name: string; url: string }> = {
  bbc:       { name: 'BBC News',      url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  aljazeera: { name: 'Al Jazeera',    url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  guardian:  { name: 'The Guardian',  url: 'https://www.theguardian.com/world/rss' },
  nyt:       { name: 'NY Times',      url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  skynews:   { name: 'Sky News',      url: 'https://feeds.skynews.com/feeds/rss/world.xml' },
};

function extractImage(item: any): string | null {
  // media:content can be a single object or an array — pick the largest
  const mc = item['media:content'];
  if (Array.isArray(mc)) {
    const sorted = [...mc].sort((a, b) => (b['@_width'] ?? 0) - (a['@_width'] ?? 0));
    return sorted[0]?.['@_url'] ?? null;
  }
  return (
    mc?.['@_url'] ??
    item['media:thumbnail']?.['@_url'] ??
    item.enclosure?.['@_url'] ??
    null
  );
}

export async function GET(request: NextRequest) {
  // page.tsx sends ?sub=, legacy direct calls may send ?source=
  const source = request.nextUrl.searchParams.get('sub')
    ?? request.nextUrl.searchParams.get('source')
    ?? 'bbc';
  const feed = SOURCES[source] ?? SOURCES.bbc;

  try {
    const res = await fetch(feed.url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const data = parser.parse(xml);

    const items: any[] = data?.rss?.channel?.item ?? [];

    const articles = items.slice(0, 8).map((item: any) => ({
      title:       typeof item.title === 'object' ? item.title['#text'] : item.title ?? '',
      url:         typeof item.link  === 'object' ? item.link['@_href']  : item.link  ?? '',
      publishedAt: item.pubDate ?? item['dc:date'] ?? null,
      description: typeof item.description === 'object'
        ? item.description['#text']
        : item.description ?? null,
      source:      { name: feed.name },
      urlToImage:  extractImage(item),
    }));

    return NextResponse.json({ articles });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
