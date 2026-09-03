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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (!res.ok) {
        fetchCatalogData(); // Revert on failure
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      fetchCatalogData();
    }
  };

  const handleToggleAvailability = async (product: ProductItem) => {
    const newActive = !product.isAvailable;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isAvailable: newActive, isActive: newActive } : p))
    );

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newActive }),
      });
      if (!res.ok) {
        fetchCatalogData(); // Revert
      } else {
        showToast(`"${product.name}" ${newActive ? "reactivated" : "deactivated"} successfully.`);
      }
    } catch (err) {
      console.error("Error toggling availability:", err);
      fetchCatalogData();
    }
  };

  const handleDelete = async (product: ProductItem) => {
    if (!confirm(`Delete "${product.name}"?\n\nIf this product has historical orders, it will be deactivated instead of permanently deleted.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        if (data.softDeleted) {
          // Product was deactivated instead — refresh to show updated state
          fetchCatalogData();
          showToast(data.message || `"${product.name}" deactivated (has historical orders).`);
        } else {
          // Hard deleted — remove from list
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          showToast(`"${product.name}" deleted from catalog.`);
        }
      } else {
        showToast(`Failed to delete "${product.name}".`);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast("Error deleting product.");
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

  const activeCount = products.filter((p) => p.isAvailable !== false && p.isActive !== false).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-4 pt-1 pb-8 text-[#111111]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] max-w-sm bg-[#111111] text-[#DFFF00] text-xs font-bold px-4 py-3 rounded-lg border border-[#DFFF00] shadow-2xl animate-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
        <div>
          <h1 className="text-xl font-extrabold text-[#111111]">
            Catalog & Stock Operations
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            Inventory management & price control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-bold px-3 py-1.5 rounded border border-[#E5E5E5] text-[#666666] hover:text-[#111111]"
          >
            ← Admin Hub
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-1.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs transition-colors border border-[#111111]"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {!loading && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs font-bold text-[#111111]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            {activeCount} Active
          </div>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs font-bold text-[#111111]">
              <span className="w-2 h-2 rounded-full bg-[#DFFF00] border border-[#111111]" />
              {lowStockCount} Low Stock
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D92D3A] rounded text-xs font-bold text-[#D92D3A]">
              <span className="w-2 h-2 rounded-full bg-[#D92D3A]" />
              {outOfStockCount} Out of Stock
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs font-bold text-[#666666]">
            {products.length} Total
          </div>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="space-y-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product name or unit..."
          className="w-full px-3.5 py-2 text-xs rounded border border-[#111111] bg-white text-[#111111] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
        />

        <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 rounded text-xs font-black transition-colors shrink-0 border ${
              selectedCategory === "ALL"
                ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
                : "bg-white border-[#E5E5E5] text-[#666666] hover:text-[#111111]"
            }`}
          >
            All Products ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded text-xs font-black transition-colors shrink-0 border ${
                selectedCategory === cat.id
                  ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
                  : "bg-white border-[#E5E5E5] text-[#666666] hover:text-[#111111]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] text-center space-y-2">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No products found
          </h3>
          <p className="text-xs text-[#666666] font-medium">
            Try adjusting your search query or add a new product to catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((product) => {
            const isActive = product.isAvailable !== false && product.isActive !== false;
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            return (
              <div
                key={product.id}
                className={`bg-white p-3.5 rounded-lg border transition-colors ${
                  !isActive ? "border-[#E5E5E5] opacity-60" : "border-[#E5E5E5] hover:border-[#111111]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 overflow-hidden font-black text-xs ${
                      isActive ? "bg-[#111111] text-[#DFFF00] border-[#111111]" : "bg-[#F5F5F5] text-[#999999] border-[#E5E5E5]"
                    }`}>
                      P
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-xs text-[#111111] truncate">
                          {product.name}
                        </h4>
                        {!isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-[#F5F5F5] text-[#999999] text-[9px] font-black border border-[#E5E5E5] uppercase">
                            Inactive
                          </span>
                        )}
                        {isOutOfStock && isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-[#D92D3A] text-white text-[9px] font-black uppercase">
                            Out of Stock
                          </span>
                        )}
                        {isLowStock && isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-[#DFFF00] text-[#000000] text-[9px] font-black border border-[#111111] uppercase">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#666666] block font-medium">
                        {product.category?.name || "—"} • {product.unitDisplay || product.unit} • ₹{product.price}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Inline Stock Stepper */}
                    <div className="flex items-center gap-1 bg-[#111111] text-white p-1 rounded border border-[#111111]">
                      <button
                        onClick={() => handleStockAdjust(product.id, product.stock, -1)}
                        className="w-6 h-6 rounded bg-[#000000] font-bold text-xs text-white hover:text-[#DFFF00]"
                      >
                        -
                      </button>
                      <span
                        className={`text-xs font-black px-2 ${
                          isOutOfStock
                            ? "text-[#D92D3A]"
                            : isLowStock
                            ? "text-[#DFFF00]"
                            : "text-white"
                        }`}
                      >
                        {product.stock}
                      </span>
                      <button
                        onClick={() => handleStockAdjust(product.id, product.stock, 1)}
                        className="w-6 h-6 rounded bg-[#000000] font-bold text-xs text-white hover:text-[#DFFF00]"
                      >
                        +
                      </button>
                    </div>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="px-3 py-1.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#111111] font-extrabold text-xs rounded transition-colors border border-[#E5E5E5]"
                    >
                      Edit
                    </button>

                    {/* Deactivate / Reactivate Toggle */}
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      title={isActive ? "Deactivate (hide from customers)" : "Reactivate (show to customers)"}
                      className={`px-3 py-1.5 font-extrabold text-xs rounded transition-colors border ${
                        isActive
                          ? "bg-white border-[#E5E5E5] text-[#666666] hover:bg-[#FFF0F0] hover:border-[#D92D3A] hover:text-[#D92D3A]"
                          : "bg-white border-[#E5E5E5] text-[#22C55E] hover:bg-[#F0FFF4] hover:border-[#22C55E]"
                      }`}
                    >
                      {isActive ? "Deactivate" : "Activate"}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(product)}
                      title="Delete product (soft-deactivates if it has historical orders)"
                      className="w-7 h-7 flex items-center justify-center rounded bg-white border border-[#E5E5E5] text-[#999999] hover:bg-[#FFF0F0] hover:border-[#D92D3A] hover:text-[#D92D3A] transition-colors font-bold text-xs"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={fetchCatalogData}
          onCategoryCreated={(newCat) => {
            setCategories((prev) => (prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat]));
            showToast(`Category "${newCat.name}" created.`);
          }}
        />
      )}

      {isCreateOpen && (
        <CreateProductModal
          categories={categories}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchCatalogData}
          onCategoryCreated={(newCat) => {
            setCategories((prev) => (prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat]));
            showToast(`Category "${newCat.name}" created.`);
          }}
        />
      )}
    </div>
  );
}



