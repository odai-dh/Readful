'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface Headline {
  title: string;
  url: string;
}

const SOURCES = [
  { label: 'BBC',        value: 'bbc' },
  { label: 'Al Jazeera', value: 'aljazeera' },
  { label: 'Guardian',   value: 'guardian' },
  { label: 'NYT',        value: 'nyt' },
  { label: 'Reuters',    value: 'reuters' },
];

export default function BreakingSection() {
  const [source, setSource]       = useState('bbc');
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const dropdownRef               = useRef<HTMLDivElement>(null);

  const fetchBreaking = useCallback(async () => {
    try {
      const res  = await fetch(`/api/breaking?source=${source}`);
      const data = await res.json();
      if (data.articles) {
        setHeadlines(data.articles.map((a: { title: string; url: string }) => ({ title: a.title, url: a.url })));
      }
    } catch { /* keep stale content */ }
    finally  { setLoading(false); }
  }, [source]);

  useEffect(() => {
    setLoading(true);
    fetchBreaking();
    const id = setInterval(fetchBreaking, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchBreaking]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeLabel = SOURCES.find(s => s.value === source)?.label ?? 'BBC';
  // Duplicate for seamless infinite loop
  const doubled = [...headlines, ...headlines];

  return (
    <div className="flex items-center h-8 bg-[#0a0a0a] border-b border-[#161616] overflow-visible">

      {/* BREAKING label */}
      <div className="flex items-center gap-1.5 px-3 border-r border-[#1a1a1a] shrink-0 h-full">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <span className="text-[9px] font-bold tracking-widest text-red-500 uppercase whitespace-nowrap">
          Breaking
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center min-w-0">
        {loading ? (
          <p className="text-[#252525] text-[11px] px-4 animate-pulse whitespace-nowrap">
            Loading headlines…
          </p>
        ) : (
          <div className="animate-ticker flex whitespace-nowrap will-change-transform">
            {doubled.map((h, i) => (
              <a
                key={i}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#484848] hover:text-[#c8c6c1] text-[11px] transition-colors duration-150"
              >
                <span className="text-[#1e1e1e] mx-4">◆</span>
                {h.title}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Source picker */}
      <div ref={dropdownRef} className="relative shrink-0 border-l border-[#1a1a1a] h-full">
        <button
          onClick={() => setOpen(v => !v)}
          className="h-full px-3 flex items-center gap-1 text-[10px] text-[#2e2e2e] hover:text-[#666] transition-colors"
        >
          {activeLabel}
          <span className="text-[8px] leading-none">▾</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-[#111] border border-[#1e1e1e] rounded-lg overflow-hidden z-50 min-w-27.5 shadow-xl">
            {SOURCES.map(s => (
              <button
                key={s.value}
                onClick={() => { setSource(s.value); setOpen(false); }}
                className={`block w-full text-left px-4 py-2.5 text-xs transition-colors ${
                  s.value === source
                    ? 'text-red-400 bg-red-500/5'
                    : 'text-[#3d3d3d] hover:text-[#888] hover:bg-[#161616]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
