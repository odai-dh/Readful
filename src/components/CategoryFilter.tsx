'use client';

export type Category =
  | 'All'
  | 'Breaking'
  | 'Football'
  | 'AI'
  | 'Science'
  | 'Business'
  | 'Health'
  | 'Politics'
  | 'Climate'
  | 'Food'
  | 'Channels'
  | 'NYT';

export const CATEGORIES: Category[] = [
  'All',
  'Breaking',
  'NYT',
  'Football',
  'Channels',
  'AI',
  'Science',
  'Business',
  'Health',
  'Politics',
  'Climate',
  'Food',
];

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`
            px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
            transition-colors duration-150 outline-none
            ${
              selected === cat
                ? 'bg-[#e8e6e1] text-[#0f0f0f]'
                : 'bg-[#1a1a1a] text-[#6a6a6a] border border-[#272727] hover:bg-[#222] hover:text-[#b0b0b0]'
            }
          `}
        >
          {cat === 'Breaking' ? (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${selected === cat ? 'bg-red-500' : 'bg-red-600'}`} />
              </span>
              Breaking
            </span>
          ) : cat}
        </button>
      ))}
    </div>
  );
}
