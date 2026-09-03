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
    <div className="space-y-6 pt-2 text-[#111111]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#111111]">
            Grocery Categories
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            Browse RushD catalog by category
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-[#DFFF00] text-[#000000] font-black border border-[#111111]">
          STOREFRONT
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className="bg-white p-4 rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl p-2 rounded-md bg-[#F5F5F5] group-hover:scale-105 transition-transform">
                  {getCategoryIcon(cat.slug, cat.icon)}
                </span>
                <span className="text-[11px] font-black text-[#111111] bg-[#DFFF00] px-2 py-0.5 rounded border border-[#111111]">
                  {cat._count?.products ?? 0} items
                </span>
              </div>
              <div className="mt-3">
                <h3 className="font-extrabold text-xs text-[#111111] group-hover:text-[#000000] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-[#666666] mt-0.5 font-medium">Instant delivery</p>
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
