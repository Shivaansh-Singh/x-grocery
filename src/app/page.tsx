"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/catalog/SearchBar";
import { CategoryPills, CategoryItem } from "@/components/catalog/CategoryPills";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ProductItem } from "@/components/catalog/ProductCard";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";

function CustomerHomeContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart state management
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  // Product detail modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Update cart quantity
  const handleUpdateQuantity = (product: ProductItem, newQty: number) => {
    setCartQuantities((prev) => ({
      ...prev,
      [product.id]: newQty,
    }));
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
    <div className="space-y-4">
      {/* Live Search Bar */}
      <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />

      {/* Category Filter Pills */}
      <div id="categories">
        <CategoryPills
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          loading={loadingCategories}
        />
      </div>

      {/* Electric Dusk Compact Hero Card */}
      {!searchQuery && activeCategory === "all" && (
        <div className="bg-[#141822]/90 backdrop-blur-md rounded-2xl p-4.5 border border-white/8 shadow-lg flex items-center justify-between gap-3 relative overflow-hidden rushd-speed-lines">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[#FF6B1A] to-[#2D6CFF] text-white shadow-xs">
                RUSH IT. ⚡ 15-MIN HYPERLOCAL
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#F5F6FA] tracking-tight">
              Your essentials. On the way.
            </h2>
            <p className="text-xs font-medium text-[#8A90A3]">
              Groceries, snacks & everyday essentials delivered fast.
            </p>
          </div>
          <div className="shrink-0 text-right z-10">
            <span className="text-xs font-black text-[#3DD68C] bg-[#3DD68C]/15 px-3 py-1.5 rounded-xl border border-[#3DD68C]/30 shadow-xs">
              FREE OVER ₹199
            </span>
          </div>
        </div>
      )}

      {/* Product Section Header & Grid */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1 border-b border-white/8 pb-2.5">
          <h2 className="font-black text-sm text-[#F5F6FA] tracking-tight flex items-center gap-2">
            <span>
              {activeCategory === "all"
                ? "Popular Near You"
                : categories.find((c) => c.slug === activeCategory)?.name || "Catalog"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B1A] inline-block" />
          </h2>
          <span className="text-xs text-[#8A90A3] font-semibold">
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
          <div className="h-10 bg-[#141822] border border-white/8 rounded-xl" />
          <div className="h-8 bg-[#141822] border border-white/8 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-[#141822] border border-white/8 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CustomerHomeContent />
    </Suspense>
  );
}
