'use client';

import { useEffect, useState, useCallback } from 'react';

interface Article {
  title: string;
  url: string;
  publishedAt: string | null;
  description: string | null;
  source: { name: string };
  urlToImage: string | null;
}

const SOURCES = [
  { label: 'BBC',        value: 'bbc' },
  { label: 'Al Jazeera', value: 'aljazeera' },
  { label: 'Guardian',   value: 'guardian' },
  { label: 'NYT',        value: 'nyt' },
  { label: 'Reuters',    value: 'reuters' },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BreakingSection() {
  const [source, setSource]   = useState('bbc');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchBreaking = useCallback(async () => {
    try {
      const res = await fetch(`/api/breaking?source=${source}`);
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
        setUpdatedAt(new Date());
      }
    } catch {
      // silently fail — stale content stays visible
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    setLoading(true);
    fetchBreaking();
    const interval = setInterval(fetchBreaking, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchBreaking]);

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-semibold tracking-widest text-red-500 uppercase">Breaking</span>
        </div>
        {updatedAt && (
          <span className="text-[10px] text-[#2a2a2a]">
            Updated {timeAgo(updatedAt.toISOString())}
          </span>
        )}
      </div>

      {/* Source filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
        {SOURCES.map((s) => (
          <button
            key={s.value}
            onClick={() => setSource(s.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors outline-none ${
              source === s.value
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : 'bg-transparent text-[#3d3d3d] border border-[#1e1e1e] hover:text-[#6a6a6a]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="divide-y divide-[#161616]">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-3 flex gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#1a1a1a] rounded w-full" />
                  <div className="h-3 bg-[#1a1a1a] rounded w-3/4" />
                  <div className="h-2 bg-[#161616] rounded w-1/4" />
                </div>
                <div className="w-14 h-14 bg-[#1a1a1a] rounded flex-shrink-0" />
              </div>
            ))
          : articles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 flex gap-3 items-start group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[#c8c6c1] text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {article.title}
                  </p>
                  <p className="text-[#2e2e2e] text-[10px] mt-1">
                    {timeAgo(article.publishedAt)}
                  </p>
                </div>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt=""
                    className="w-14 h-14 object-cover rounded flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </a>
            ))
        }
      </div>

      <div className="mt-3 border-t border-[#111]" />
    </section>
  );
}
