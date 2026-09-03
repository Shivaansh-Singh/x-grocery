"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/catalog/SearchBar";
import { CategoryPills, CategoryItem } from "@/components/catalog/CategoryPills";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductItem } from "@/components/catalog/ProductCard";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import { useCart } from "@/components/providers/CartProvider";

function CustomerHomeContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart state management directly from unified CartProvider
  const { items, updateQuantity } = useCart();

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derived cart quantities map for fast lookup
  const cartQuantities = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.product.id] = item.quantity;
    return acc;
  }, {});

  // Fetch categories
  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (!ignore && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        if (!ignore) setLoadingCategories(false);
      }
    }
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch products
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== "all") {
          params.set("category", activeCategory);
        }
        if (searchQuery && searchQuery.trim() !== "") {
          params.set("search", searchQuery.trim());
        }
        const queryString = params.toString() ? `?${params.toString()}` : "";

        const res = await fetch(`/api/products${queryString}`);
        const data = await res.json();
        if (!ignore && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        if (!ignore) setLoadingProducts(false);
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [activeCategory, searchQuery]);

  // Update cart quantity using unified CartProvider
  const handleUpdateQuantity = (product: ProductItem, newQty: number) => {
    updateQuantity(product, newQty);
  };

  const handleSelectCategory = (catSlug: string) => {
    setActiveCategory((prev) => {
      if (prev !== catSlug) {
        setLoadingProducts(true);
        return catSlug;
      }
      return prev;
    });
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery((prev) => {
      if (prev !== query) {
        setLoadingProducts(true);
        return query;
      }
      return prev;
    });
  }, []);

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Live Search Bar */}
      <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />

      {/* Editorial High-Contrast Hero Banner */}
      {!searchQuery && (
        <div className="bg-[#000000] border border-[#111111] rounded-lg p-6 sm:p-8 relative overflow-hidden text-white">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded bg-[#DFFF00] text-[#000000]">
                10-MIN EXPRESS
              </span>
            </div>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight max-w-md">
              Everything you need.<br />Delivered fast.
            </h2>
            <p className="text-xs font-medium text-[#A3A3A3] max-w-md leading-relaxed">
              Groceries, snacks & everyday essentials at your doorstep.
            </p>
            <div className="pt-1">
              <a
                href="#categories"
                className="inline-block px-5 py-2.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] text-xs font-black tracking-wider transition-colors border border-[#111111]"
              >
                SHOP NOW →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Category Navigation / Filter Row (Directly below Hero) */}
      <div id="categories">
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          loading={loadingCategories}
        />
      </div>

      {/* Product Section Header & Grid */}
      <div id="catalog" className="pt-1">
        <div className="flex items-end justify-between mb-4 px-1 border-b border-[#E5E5E5] pb-3">
          <div>
            <h2 className="font-extrabold text-lg text-[#111111] tracking-tight">
              {activeCategory === "all"
                ? "Popular Near You"
                : categories.find((c) => c.slug === activeCategory)?.name || "Catalog"}
            </h2>
          </div>
          <span className="text-xs text-[#666666] font-bold">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        <ProductGrid
          products={products}
          loading={loadingProducts}
          cartQuantities={cartQuantities}
          onUpdateQuantity={handleUpdateQuantity}
          onSelectProduct={handleSelectProduct}
          searchQuery={searchQuery}
        />
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quantity={selectedProduct ? cartQuantities[selectedProduct.id] || 0 : 0}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-12 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <CustomerHomeContent />
    </Suspense>
  );
}
