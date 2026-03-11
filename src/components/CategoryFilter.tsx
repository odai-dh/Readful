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
          {cat}
        </button>
      ))}
    </div>
  );
}
