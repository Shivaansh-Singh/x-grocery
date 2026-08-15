"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Grocery Categories
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Browse Store X catalog by category
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
          Store X Hub
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.slug, cat.icon)}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {cat._count?.products ?? 0} items
                </span>
              </div>
              <div className="mt-3">
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Instant delivery</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(slug: string, fallback?: string | null): string {
  if (fallback && fallback.length <= 2) return fallback;
  switch (slug) {
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
