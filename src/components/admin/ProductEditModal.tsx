"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  onCategoryCreated?: (newCategory: CategoryOption) => void;
}

export function ProductEditModal({
  product,
  categories,
  onClose,
  onSave,
  onCategoryCreated,
}: ProductEditModalProps) {
  const [localCategories, setLocalCategories] = useState<CategoryOption[]>(categories);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [unit, setUnit] = useState(product.unitDisplay || product.unit || "1 pack");
  const [stock, setStock] = useState(product.stock.toString());
  const [categoryId, setCategoryId] = useState(product.categoryId || categories[0]?.id || "");
  const [description, setDescription] = useState(product.description || "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(product.isAvailable ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Category inline creation state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalCategories(categories);
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleCreateCategory = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setCategoryError(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.category) {
        throw new Error(data.error || "Failed to create category");
      }

      const createdCat: CategoryOption = {
        id: data.category.id,
        name: data.category.name,
      };

      setLocalCategories((prev) => {
        if (prev.some((c) => c.id === createdCat.id)) return prev;
        return [...prev, createdCat];
      });
      setCategoryId(createdCat.id);
      setIsAddingCategory(false);
      setNewCategoryName("");
      onCategoryCreated?.(createdCat);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setCategoryError(msg);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME Type
    const validMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type.toLowerCase())) {
      setImageError("Please select a JPG, PNG, or WEBP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate 5 MB Size Limit
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setImageError("Product image must be smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageUrl("");
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

    // Frontend validation
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a non-negative number.");
      return;
    }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError("Stock must be a non-negative integer.");
      return;
    }

    setSaving(true);

    try {
      let finalImageUrl = imageUrl.trim();

      // 1. Upload new image if a new local file was selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", selectedFile);

        const uploadRes = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload product image.");
        }

        finalImageUrl = uploadData.url;
      }

      // 2. Update the product
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parsedPrice,
          unit,
          stock: parsedStock,
          categoryId,
          description,
          imageUrl: finalImageUrl,
          isAvailable,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save changes. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#111111] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-[#111111]">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
          <h3 className="font-extrabold text-base text-[#111111]">
            Edit Product Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-[#D92D3A] text-[#D92D3A] rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-[#111111] block mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#111111] block mb-1">Price (₹)</label>
              <input
                type="number"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div>
              <label className="font-bold text-[#111111] block mb-1">Stock Count</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#111111] block mb-1">Unit Display</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 500g / 1 L"
                required
                className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#111111] block">Category *</label>
                {!isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(true);
                      setCategoryError(null);
                    }}
                    className="text-[11px] font-extrabold text-[#111111] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    + New Category
                  </button>
                )}
              </div>

              {isAddingCategory ? (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Frozen Foods"
                      className="flex-1 px-2.5 py-1.5 text-xs rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="px-2.5 py-1.5 bg-[#DFFF00] hover:bg-[#C8E600] text-black font-extrabold text-xs rounded border border-[#111111] disabled:opacity-50 cursor-pointer"
                    >
                      {creatingCategory ? "..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName("");
                        setCategoryError(null);
                      }}
                      className="px-2 py-1.5 bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#666666] font-bold text-xs rounded border border-[#E5E5E5] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  {categoryError && (
                    <p className="text-[10px] text-[#D92D3A] font-bold">{categoryError}</p>
                  )}
                </div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                >
                  {localCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Product Image Section */}
          <div className="space-y-2 p-3 bg-[#F5F5F5] rounded-lg border border-[#E5E5E5]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#111111] block">Product Image</label>
              <span className="text-[10px] text-[#666666] font-medium">Max 5 MB (JPG, PNG, WEBP)</span>
            </div>

            {imageError && (
              <p className="text-[11px] text-[#D92D3A] font-bold">{imageError}</p>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {imagePreview || imageUrl ? (
              <div className="flex items-center gap-3 p-2 bg-white rounded border border-[#E5E5E5]">
                <div className="relative w-16 h-16 rounded border border-[#111111] bg-[#F5F5F5] overflow-hidden shrink-0 flex items-center justify-center">
                  <Image
                    src={imagePreview || imageUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-bold text-[#111111] truncate">
                    {selectedFile ? selectedFile.name : imageUrl}
                  </p>
                  {selectedFile && (
                    <span className="text-[10px] text-[#666666] font-medium block">
                      {(selectedFile.size / 1024).toFixed(0)} KB (New upload pending save)
                    </span>
                  )}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-[#111111] hover:underline"
                    >
                      {selectedFile ? "Change Image" : "Replace Image"}
                    </button>
                    <span className="text-[#E5E5E5]">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] font-bold text-[#D92D3A] hover:underline"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border border-dashed border-[#111111] bg-white hover:bg-yellow-50 rounded-lg text-center transition-colors group flex items-center justify-center gap-2"
                >
                  <span className="text-base">📸</span>
                  <span className="text-xs font-extrabold text-[#111111] group-hover:underline">
                    + Upload Image from Device
                  </span>
                </button>
                <div className="pt-1">
                  <span className="text-[10px] text-[#666666] font-medium block mb-1">
                    Or paste image URL (optional fallback):
                  </span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                    placeholder="/images/placeholder.jpg or https://..."
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="font-bold text-[#111111] block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded border border-[#111111] bg-white text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAvailable"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 accent-[#111111] rounded"
            />
            <label htmlFor="isAvailable" className="font-bold text-[#111111]">
              Active / Visible in Catalog
            </label>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded border border-[#E5E5E5] text-[#666666] font-bold hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black border border-[#111111] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
