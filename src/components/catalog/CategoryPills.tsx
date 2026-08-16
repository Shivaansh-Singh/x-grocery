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
            className="h-8 w-24 bg-zinc-200 rounded-lg shrink-0"
          />
        ))}
      </div>
    );
  }

  const allCategory: CategoryItem = {
    id: "all",
    name: "All Items",
    slug: "all",
  };

  const fullList = [allCategory, ...categories];

  return (
    <div className="sticky top-[52px] z-30 bg-[#F5F3EE]/95 backdrop-blur-md py-2 px-1 border-b border-[#D9D7D2]/60">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {fullList.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isSelected
                  ? "bg-[#FF5A1F] text-white shadow-2xs"
                  : "bg-[#FFFFFF] text-[#666A70] hover:text-[#111315] hover:bg-[#ECEAE5] border border-[#D9D7D2]"
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
