"use client";

import { useState } from "react";
import type { ProductItem } from "@/components/catalog/ProductCard";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductEditModalProps {
  product: ProductItem;
  categories: CategoryOption[];
  onClose: () => void;
  onSave: () => void;
}

export function ProductEditModal({
  product,
  categories,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [unit, setUnit] = useState(product.unitDisplay || product.unit || "1 pack");
  const [stock, setStock] = useState(product.stock.toString());
  const [categoryId, setCategoryId] = useState(product.categoryId || categories[0]?.id || "");
  const [description, setDescription] = useState(product.description || "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [isAvailable, setIsAvailable] = useState(product.isAvailable ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          unit,
          stock: parseInt(stock, 10),
          categoryId,
          description,
          imageUrl,
          isAvailable,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9D7D2] p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#D9D7D2] pb-3">
          <h3 className="font-bold text-base text-[#111315]">
            Edit Product Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ECEAE5] flex items-center justify-center text-[#666A70] font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#F5F3EE] border border-[#C63D3D] text-[#C63D3D] rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#111315] block mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111315] block mb-1">Price (₹)</label>
              <input
                type="number"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#111315] block mb-1">Stock Count</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111315] block mb-1">Unit Display</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 500g / 1 L"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#111315] block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111315] block mb-1">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#111315] block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-[#D9D7D2] bg-[#FFFFFF] text-[#111315] focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 text-[#FF5A1F] rounded"
            />
            <label htmlFor="isAvailable" className="font-semibold text-[#111315]">
              Active / Visible in Catalog
            </label>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#D9D7D2] text-[#111315] font-bold hover:bg-[#ECEAE5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-[#FF5A1F] text-white font-bold hover:bg-[#111315] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
