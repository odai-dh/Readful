'use client';

import { useEffect, useState, useCallback } from 'react';

interface Team {
  name: string;
  shortName: string;
  crest: string;
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  minute?: number;
  competition: { name: string };
  homeTeam: Team;
  awayTeam: Team;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

const LIVE_STATUSES     = new Set(['IN_PLAY', 'PAUSED', 'LIVE']);
const UPCOMING_STATUSES = new Set(['TIMED', 'SCHEDULED']);
const DONE_STATUSES     = new Set(['FINISHED']);

function matchOrder(m: Match): number {
  if (LIVE_STATUSES.has(m.status))     return 0;
  if (UPCOMING_STATUSES.has(m.status)) return 1;
  if (DONE_STATUSES.has(m.status))     return 2;
  return 3;
}

function StatusBadge({ match }: { match: Match }) {
  if (LIVE_STATUSES.has(match.status)) {
    const label = match.status === 'PAUSED' ? 'HT' : match.minute ? `${match.minute}'` : 'LIVE';
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
        </span>
        {label}
      </span>
    );
  }
  if (UPCOMING_STATUSES.has(match.status)) {
    const time = new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isToday = new Date(match.utcDate).toDateString() === new Date().toDateString();
    return <span className="text-[10px] text-[#4a4a4a]">{isToday ? time : `Tomorrow ${time}`}</span>;
  }
  if (DONE_STATUSES.has(match.status)) {
    return <span className="text-[10px] text-[#333]">FT</span>;
  }
  return <span className="text-[10px] text-[#333]">{match.status}</span>;
}

function Score({ match }: { match: Match }) {
  const { home, away } = match.score.fullTime;
  if (LIVE_STATUSES.has(match.status) || DONE_STATUSES.has(match.status)) {
    return (
      <span className="text-sm font-bold text-[#c8c6c1] tabular-nums">
        {home ?? 0} – {away ?? 0}
      </span>
    );
  }
  return <span className="text-xs text-[#2e2e2e]">vs</span>;
}

function Crest({ src, name }: { src: string; name: string }) {
  return (
    <img
      src={src}
      alt={name}
      className="w-5 h-5 object-contain"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

export default function LiveScores() {
  const [matches, setMatches]   = useState<Match[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      const res  = await fetch('/api/scores');
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setMatches(data.matches);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError('Could not load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const id = setInterval(fetchScores, 60_000);
    return () => clearInterval(id);
  }, [fetchScores]);

  const hasLive = matches.some(m => LIVE_STATUSES.has(m.status));

  // Group by competition, sorted live → upcoming → finished
  const sorted = [...matches].sort((a, b) => matchOrder(a) - matchOrder(b) || new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());
  const byComp: Record<string, Match[]> = {};
  for (const m of sorted) {
    const key = m.competition.name;
    if (!byComp[key]) byComp[key] = [];
    byComp[key].push(m);
  }

  return (
    <div className="mb-6 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#161616]">
        <div className="flex items-center gap-2">
          {hasLive && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
            </span>
          )}
          <span className="text-xs font-semibold text-[#c8c6c1]">
            {hasLive ? 'Live & Upcoming' : 'Today\'s Matches'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-[#2a2a2a]">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={fetchScores} className="text-[10px] text-[#2a2a2a] hover:text-[#555] transition-colors">↻</button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="h-3 bg-[#1a1a1a] rounded w-32" />
              <div className="h-3 bg-[#1a1a1a] rounded w-8" />
              <div className="h-3 bg-[#1a1a1a] rounded w-32" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="px-4 py-4 text-xs text-[#3a3a3a]">{error}</p>
      ) : matches.length === 0 ? (
        <p className="px-4 py-4 text-xs text-[#2e2e2e]">No matches scheduled today or tomorrow.</p>
      ) : (
        <div className="divide-y divide-[#111]">
          {Object.entries(byComp).map(([comp, compMatches]) => (
            <div key={comp}>
              <p className="px-4 pt-2.5 pb-1 text-[9px] font-semibold tracking-widest uppercase text-[#2a2a2a]">
                {comp}
              </p>
              {compMatches.map(match => (
                <div
                  key={match.id}
                  className={`flex items-center px-4 py-2 gap-2 ${LIVE_STATUSES.has(match.status) ? 'bg-green-500/[0.03]' : ''}`}
                >
                  {/* Home team */}
                  <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                    <span className="text-xs text-[#888] truncate text-right">{match.homeTeam.shortName}</span>
                    <Crest src={match.homeTeam.crest} name={match.homeTeam.shortName} />
                  </div>

                  {/* Centre: score + status */}
                  <div className="flex flex-col items-center gap-0.5 w-20 shrink-0">
                    <Score match={match} />
                    <StatusBadge match={match} />
                  </div>

                  {/* Away team */}
                  <div className="flex items-center gap-1.5 flex-1 justify-start min-w-0">
                    <Crest src={match.awayTeam.crest} name={match.awayTeam.shortName} />
                    <span className="text-xs text-[#888] truncate">{match.awayTeam.shortName}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
