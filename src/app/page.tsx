'use client';

import { useState, useEffect, useCallback } from 'react';
import CategoryFilter, { CATEGORIES, type Category } from '@/components/CategoryFilter';
import ArticleCard, { type Article } from '@/components/ArticleCard';
import SubFilter, { getDefaultSub } from '@/components/SubFilter';
import LiveScores from '@/components/LiveScores';

const DAILY_CAP = 20;
const DISMISSED_KEY = 'readful_dismissed';
const CATEGORY_KEY = 'readful_category';

function SkeletonCard() {
  return (
    <div className="border border-[#1a1a1a] rounded-xl p-5 bg-[#141414] animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-[#1f1f1f] rounded w-28" />
        <div className="h-3 bg-[#1f1f1f] rounded w-12" />
      </div>
      <div className="h-4 bg-[#1f1f1f] rounded w-full mb-2" />
      <div className="h-4 bg-[#1f1f1f] rounded w-4/5 mb-4" />
      <div className="h-3 bg-[#1a1a1a] rounded w-24" />
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState<Category>('All');
  const [subFilter, setSubFilter] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DISMISSED_KEY);
      if (raw) setDismissed(new Set(JSON.parse(raw)));

      const savedCat = localStorage.getItem(CATEGORY_KEY);
      if (savedCat && (CATEGORIES as string[]).includes(savedCat)) setCategory(savedCat as Category);
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist category
  useEffect(() => {
    if (hydrated) localStorage.setItem(CATEGORY_KEY, category);
  }, [category, hydrated]);

  // Fetch articles whenever category or subFilter changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (category === 'Football' && subFilter === 'live') return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ category });
    if (subFilter) params.set('sub', subFilter);

    const apiPath = category === 'NYT' ? '/api/nyt' : category === 'Breaking' ? '/api/breaking' : '/api/news';
    fetch(`${apiPath}?${params}`)
      .then((res) => res.json())
      .then((data: { articles?: Article[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setArticles(data.articles ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, subFilter, hydrated]);

  const handleDismiss = useCallback((url: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(url);
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    setSubFilter(getDefaultSub(cat));
    setArticles([]);
  }, []);

  const undismissed = articles.filter((a) => !dismissed.has(a.url));
  const visible = undismissed.slice(0, DAILY_CAP);
  const hitCap = undismissed.length > DAILY_CAP;

  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-16">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[#e8e6e1] tracking-tight">Readful</h1>
          <p className="text-sm text-[#3d3d3d] mt-1">Your daily news, without the noise.</p>
        </header>

        {/* Sticky category bar */}
        <div className="sticky top-0 z-10 bg-[#0f0f0f] pt-2 pb-4 -mx-4 px-4">
          <CategoryFilter selected={category} onChange={handleCategoryChange} />
          <SubFilter category={category} selected={subFilter} onChange={setSubFilter} />
        </div>

        {/* Live scores — Football › Live sub-filter */}
        {category === 'Football' && subFilter === 'live' ? (
          <LiveScores />
        ) : loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-2 border border-red-900/40 bg-red-950/20 rounded-xl p-5">
            <p className="text-sm font-medium text-red-400 mb-1">Could not load articles</p>
            <p className="text-xs text-red-500/60">{error}</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-[#3d3d3d] text-base">All caught up.</p>
            <p className="text-[#2e2e2e] text-sm mt-1">
              No more articles — check back later or try another category.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col gap-3">
              {visible.map((article) => (
                <ArticleCard
                  key={article.url}
                  article={article}
                  onDismiss={() => handleDismiss(article.url)}
                />
              ))}
            </div>

            {hitCap && (
              <p className="mt-6 text-center text-xs text-[#3d3d3d] border border-[#1a1a1a] rounded-xl py-4 px-6">
                You&apos;ve reached today&apos;s limit of {DAILY_CAP} articles.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
