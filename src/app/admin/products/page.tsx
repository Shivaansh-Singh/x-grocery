"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductEditModal } from "@/components/admin/ProductEditModal";
import { CreateProductModal } from "@/components/admin/CreateProductModal";
import type { ProductItem } from "@/components/catalog/ProductCard";

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCatalogData = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.products) setProducts(data.products);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadCatalog() {
      try {
        const res = await fetch("/api/admin/products");
        const data = await res.json();
        if (!ignore && data.products) setProducts(data.products);
        if (!ignore && data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load admin products:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      ignore = true;
    };
  }, []);

  const handleStockAdjust = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, isAvailable: newStock > 0 } : p))
    );

    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
    } catch (err) {
      console.error("Error updating stock:", err);
      fetchCatalogData(); // Revert on failure
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.unit || p.unitDisplay || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pt-1 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-2">
        <div>
          <h1 className="text-xl font-bold text-[#111315]">
            Catalog & Stock Operations
          </h1>
          <p className="text-xs text-[#666A70]">
            Inventory management & price control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#D9D7D2] text-[#666A70] hover:text-[#111315]"
          >
            ← Admin Hub
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF5A1F] hover:bg-[#111315] text-white font-bold text-xs shadow-2xs transition-colors"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product name or unit..."
          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]"
        />

        <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-[#111315] text-white"
                : "bg-[#FFFFFF] border border-[#D9D7D2] text-[#666A70] hover:text-[#111315]"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#111315] text-white"
                  : "bg-[#FFFFFF] border border-[#D9D7D2] text-[#666A70] hover:text-[#111315]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Table / Grid */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-zinc-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-2xl p-8 border border-[#D9D7D2] text-center space-y-2">
          <h3 className="font-bold text-sm text-[#111315]">
            No products found
          </h3>
          <p className="text-xs text-[#666A70]">
            Try adjusting your search query or add a new product to catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#D9D7D2] shadow-2xs flex items-center justify-between gap-3"
            >
              {/* Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3EE] border border-[#D9D7D2] flex items-center justify-center shrink-0 overflow-hidden font-bold text-xs text-[#111315]">
                  P
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-[#111315] truncate">
                    {product.name}
                  </h4>
                  <span className="text-[11px] text-[#666A70] block">
                    {product.unitDisplay || product.unit} • ₹{product.price}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Inline Stock Stepper */}
                <div className="flex items-center gap-1 bg-[#F5F3EE] p-1 rounded-xl border border-[#D9D7D2]">
                  <button
                    onClick={() => handleStockAdjust(product.id, product.stock, -1)}
                    className="w-6 h-6 rounded-lg bg-[#FFFFFF] font-bold text-xs text-[#111315] shadow-2xs hover:bg-[#ECEAE5]"
                  >
                    -
                  </button>
                  <span
                    className={`text-xs font-bold px-2 ${
                      product.stock <= 5
                        ? "text-[#C63D3D] font-black"
                        : "text-[#111315]"
                    }`}
                  >
                    {product.stock}
                  </span>
                  <button
                    onClick={() => handleStockAdjust(product.id, product.stock, 1)}
                    className="w-6 h-6 rounded-lg bg-[#FFFFFF] font-bold text-xs text-[#111315] shadow-2xs hover:bg-[#ECEAE5]"
                  >
                    +
                  </button>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditingProduct(product)}
                  className="px-3 py-1.5 bg-[#ECEAE5] hover:bg-[#D9D7D2] text-[#111315] font-bold text-xs rounded-xl transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={fetchCatalogData}
        />
      )}

      {isCreateOpen && (
        <CreateProductModal
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchCatalogData}
        />
      )}
    </div>
  );
}
