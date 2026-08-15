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

  // Cart state management (local state for catalog stepper)
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
      {/* Top Hero Delivery Bar */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            ⚡ {appConfig.deliveryTargetMins} Mins Delivery
          </span>
          <span className="text-[11px] text-emerald-100 font-medium">Store X Partner</span>
        </div>
        <h1 className="text-lg font-bold mt-2.5 leading-snug">
          VIT Bhopal Off-Campus Grocery Store
        </h1>
        <p className="text-xs text-emerald-100 mt-0.5">
          {appConfig.serviceArea}
        </p>
      </div>

      {/* Live Search Bar */}
      <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />

      {/* Sticky Category Filter Pills */}
      <CategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        loading={loadingCategories}
      />

      {/* Product Grid Section */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
            {activeCategory === "all"
              ? "All Products"
              : categories.find((c) => c.slug === activeCategory)?.name || "Catalog"}
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
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
          <div className="h-28 bg-emerald-700/30 rounded-3xl" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CustomerHomeContent />
    </Suspense>
  );
}
