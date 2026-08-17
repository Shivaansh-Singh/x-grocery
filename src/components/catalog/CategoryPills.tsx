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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-8 w-28 bg-[#141822] border border-white/8 rounded-xl shrink-0"
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
    <div className="sticky top-[56px] z-30 bg-[#0B0E14]/90 backdrop-blur-md py-2 border-b border-white/8 -mx-4 px-4 sm:-mx-6 sm:px-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 flex-nowrap">
        {fullList.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 select-none flex items-center gap-1.5 ${
                isSelected
                  ? "bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white shadow-[0_0_14px_rgba(45,108,255,0.30)] scale-[1.02]"
                  : "bg-[#141822] text-[#8A90A3] hover:text-[#F5F6FA] hover:bg-[#1A1F2C] border border-white/8"
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
