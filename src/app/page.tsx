"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { appConfig } from "@/config/app.config";
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
        const url = new URL("/api/products", window.location.origin);
        if (activeCategory && activeCategory !== "all") {
          url.searchParams.set("category", activeCategory);
        }
        if (searchQuery && searchQuery.trim() !== "") {
          url.searchParams.set("search", searchQuery.trim());
        }

        const res = await fetch(url.toString());
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
    setLoadingProducts(true);
    setActiveCategory(catSlug);
  };

  const handleSearch = useCallback((query: string) => {
    setLoadingProducts(true);
    setSearchQuery(query);
  }, []);

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Brand Hero Banner */}
      <div className="bg-[#111315] text-white rounded-2xl p-4 shadow-sm border border-[#1646C7]/30 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#FF5A1F] uppercase tracking-wider">
            RushD Instant Delivery
          </span>
          <span className="text-[10px] text-zinc-400 font-semibold px-2 py-0.5 rounded bg-white/10">
            {appConfig.deliveryTargetMins} mins
          </span>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-black text-white tracking-tight">
            Your essentials. On the way.
          </h1>
          <p className="text-xs text-[#666A70] mt-0.5 font-medium">
            Fresh groceries, snacks & hostel essentials delivered off-campus.
          </p>
        </div>
      </div>

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

      {/* Product Section Header & Grid */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2.5 px-1 border-b border-[#D9D7D2] pb-2">
          <h2 className="font-bold text-sm text-[#111315]">
            {activeCategory === "all"
              ? "Popular Near You"
              : categories.find((c) => c.slug === activeCategory)?.name || "Catalog"}
          </h2>
          <span className="text-xs text-[#666A70] font-medium">
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
          <div className="h-24 bg-zinc-200 rounded-2xl" />
          <div className="h-10 bg-zinc-200 rounded-xl" />
          <div className="h-8 bg-zinc-200 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-zinc-200 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CustomerHomeContent />
    </Suspense>
  );
}
