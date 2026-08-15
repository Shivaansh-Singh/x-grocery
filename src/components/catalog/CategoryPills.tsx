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
            className="h-8 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0"
          />
        ))}
      </div>
    );
  }

  const allCategory: CategoryItem = {
    id: "all",
    name: "All Items",
    slug: "all",
    icon: "✨",
  };

  const fullList = [allCategory, ...categories];

  return (
    <div className="sticky top-[57px] z-30 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-md py-2 px-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {fullList.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-xs dark:bg-emerald-500 font-semibold"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {cat.icon && <span className="text-sm">{getCategoryIcon(cat.slug, cat.icon)}</span>}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getCategoryIcon(slug: string, fallback?: string | null): string {
  if (fallback && fallback.length <= 2) return fallback;
  switch (slug) {
    case "all":
      return "✨";
    case "fresh-produce":
      return "🥕";
    case "dairy-eggs":
      return "🥛";
    case "snacks-munchies":
      return "🍿";
    case "instant-food":
      return "🍜";
    case "beverages-drinks":
      return "🧃";
    case "hostel-essentials":
      return "🧴";
    default:
      return "📦";
  }
}
