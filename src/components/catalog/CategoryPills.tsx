"use client";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface CategoryPillsProps {
  categories: CategoryItem[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  loading?: boolean;
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelectCategory,
  loading = false,
}: CategoryPillsProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2 px-1 no-scrollbar animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-24 bg-[#151B24] border border-[#27313D] rounded-xl shrink-0"
          />
        ))}
      </div>
    );
  }

  const allCategory: CategoryItem = {
    id: "all",
    name: "⚡ All Items",
    slug: "all",
  };

  const fullList = [allCategory, ...categories];

  return (
    <div className="sticky top-[56px] z-30 bg-[#0D1117]/95 backdrop-blur-md py-2 px-1 border-b border-[#27313D]">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {fullList.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? "bg-[#FF5A00] text-white shadow-sm scale-[1.02]"
                  : "bg-[#151B24] text-[#A8B0BC] hover:text-[#FFFFFF] hover:bg-[#1C2430] border border-[#27313D]"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
