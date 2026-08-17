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

      {/* Compact Quick Delivery Feature Card */}
      {!searchQuery && activeCategory === "all" && (
        <div className="bg-[#151B24] rounded-2xl p-4 border border-[#27313D] shadow-md flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#FF5A00]/15 text-[#FF5A00] border border-[#FF5A00]/30">
                ⚡ 15-MIN HYPERLOCAL
              </span>
              <span className="text-[10px] font-bold text-[#A8B0BC]">
                VIT Bhopal Off-Campus
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-[#FFFFFF] tracking-tight">
              Hostel Essentials & Snacks Delivered Fast
            </h2>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs font-black text-[#19B978] bg-[#19B978]/15 px-2.5 py-1 rounded-xl border border-[#19B978]/30">
              FREE OVER ₹199
            </span>
          </div>
        </div>
      )}

      {/* Product Section Header & Grid */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-3 px-1 border-b border-[#27313D] pb-2.5">
          <h2 className="font-extrabold text-sm text-[#FFFFFF] tracking-tight">
            {activeCategory === "all"
              ? "Popular Near You"
              : categories.find((c) => c.slug === activeCategory)?.name || "Catalog"}
          </h2>
          <span className="text-xs text-[#A8B0BC] font-semibold">
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
          <div className="h-10 bg-[#151B24] border border-[#27313D] rounded-xl" />
          <div className="h-8 bg-[#151B24] border border-[#27313D] rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-[#151B24] border border-[#27313D] rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CustomerHomeContent />
    </Suspense>
  );
}
