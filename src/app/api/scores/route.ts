import { NextResponse } from 'next/server';

const BASE = 'https://api.football-data.org/v4';
// Free tier competitions: PL, La Liga, Bundesliga, Serie A, Ligue 1, Champions League
const COMPETITIONS = '2021,2014,2002,2019,2015,2001';

export async function GET() {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'FOOTBALL_API_KEY not configured' }, { status: 500 });
  }

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

  const res = await fetch(
    `${BASE}/matches?dateFrom=${today}&dateTo=${tomorrow}&competitions=${COMPETITIONS}`,
    {
      headers: { 'X-Auth-Token': key },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err.message ?? 'API error' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ matches: data.matches ?? [] });
}
