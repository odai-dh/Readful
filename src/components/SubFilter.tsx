'use client';

const FOOTBALL_CLUBS = [
  { label: 'All Clubs', value: '' },
  { label: 'Barcelona', value: 'FC Barcelona' },
  { label: 'Real Madrid', value: 'Real Madrid' },
  { label: 'Man City', value: 'Manchester City' },
  { label: 'Arsenal', value: 'Arsenal' },
  { label: 'Liverpool', value: 'Liverpool' },
  { label: 'Chelsea', value: 'Chelsea' },
  { label: 'PSG', value: 'Paris Saint-Germain' },
  { label: 'Bayern', value: 'Bayern Munich' },
  { label: 'Juventus', value: 'Juventus' },
  { label: 'Inter Milan', value: 'Inter Milan' },
  { label: 'AC Milan', value: 'AC Milan' },
  { label: 'Atlético', value: 'Atletico Madrid' },
  { label: 'Dortmund', value: 'Borussia Dortmund' },
];

const NEWS_CHANNELS = [
  { label: 'Al Jazeera', value: 'al-jazeera-english' },
  { label: 'BBC News', value: 'bbc-news' },
  { label: 'Reuters', value: 'reuters' },
  { label: 'The Guardian', value: 'the-guardian-uk' },
  { label: 'AP', value: 'associated-press' },
  { label: 'CNN', value: 'cnn' },
  { label: 'Sky News', value: 'sky-news' },
  { label: 'BBC Sport', value: 'bbc-sport' },
  { label: 'ESPN', value: 'espn' },
  { label: 'Sky Sports', value: 'sky-sports-news' },
  { label: 'talkSPORT', value: 'talksport' },
];

const NYT_SECTIONS = [
  { label: 'Top Stories', value: 'Home' },
  { label: 'World',       value: 'World' },
  { label: 'US',          value: 'US' },
  { label: 'Politics',    value: 'Politics' },
  { label: 'Technology',  value: 'Technology' },
  { label: 'Science',     value: 'Science' },
  { label: 'Health',      value: 'Health' },
  { label: 'Business',    value: 'Business' },
  { label: 'Sports',      value: 'Sports' },
  { label: 'Food',        value: 'Food' },
  { label: 'Arts',        value: 'Arts' },
  { label: 'Opinion',     value: 'Opinion' },
];

const OPTIONS: Record<string, { label: string; value: string }[]> = {
  Football: FOOTBALL_CLUBS,
  Channels: NEWS_CHANNELS,
  NYT:      NYT_SECTIONS,
};

export function getDefaultSub(category: string): string {
  if (category === 'Channels') return 'al-jazeera-english';
  if (category === 'NYT') return 'Home';
  return '';
}

interface SubFilterProps {
  category: string;
  selected: string;
  onChange: (value: string) => void;
}

export default function SubFilter({ category, selected, onChange }: SubFilterProps) {
  const options = OPTIONS[category];
  if (!options) return null;

  return (
    <div className="flex gap-2 overflow-x-auto mt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
      {options.map((opt) => (
        <button
          key={opt.value || '__all__'}
          onClick={() => onChange(opt.value)}
          className={`
            px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
            transition-colors duration-150 outline-none
            ${
              selected === opt.value
                ? 'bg-[#272727] text-[#c8c6c1] border border-[#3a3a3a]'
                : 'bg-transparent text-[#3d3d3d] border border-[#1e1e1e] hover:text-[#6a6a6a] hover:border-[#252525]'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
