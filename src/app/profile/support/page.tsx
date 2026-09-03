"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

function SupportContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "feedback" ? "feedback" : "contact";

  const { user, activeUser } = useAuth();
  const userId = activeUser?.id || user?.id || "guest-user-session";
  const userEmail = activeUser?.email || user?.email || "";
  const userName = activeUser?.name || "Customer";

  const [tab, setTab] = useState<"contact" | "feedback">(initialTab);
  const [feedbackType, setFeedbackType] = useState<"COMPLAINT" | "FEEDBACK" | "PRODUCT_REQUEST">("COMPLAINT");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Photo Attachment
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setPhotoError("Please upload a JPG, PNG, or WEBP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be smaller than 5 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedPhoto(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setPhotoError(null);

    const cleanMsg = message.trim();
    if (!cleanMsg) {
      setError("Please describe your issue or feedback.");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;

      if (selectedPhoto) {
        const formData = new FormData();
        formData.append("file", selectedPhoto);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          throw new Error(uploadData.error || "Failed to upload photo attachment.");
        }
        uploadedImageUrl = uploadData.url;
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: userId,
          name: userName,
          phone: phone.trim() || null,
          email: userEmail,
          type: feedbackType,
          message: cleanMsg,
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket.");
      }

      setSuccess("Thank you! Your ticket has been logged with RushD Support.");
      setMessage("");
      handleRemovePhoto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-12 text-[#111111] dark:text-[#F5F5F5]">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-[#F5F5F5] dark:bg-[#222222] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] flex items-center justify-center font-bold text-sm transition-colors border border-[#E5E5E5] dark:border-[#333333]"
          aria-label="Back to Account"
        >
          ←
        </Link>
        <div>
          <h1 className="text-lg font-extrabold text-[#111111] dark:text-[#F5F5F5] tracking-tight">
            Customer Support &amp; Help Desk
          </h1>
          <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] font-medium">
            RushD customer care, grievance redressal and feedback
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-[#F5F5F5] dark:bg-[#1E1E1E] p-1 border border-[#E5E5E5] dark:border-[#262626]">
        <button
          type="button"
          onClick={() => {
            setTab("contact");
            setError(null);
            setSuccess(null);
          }}
          className={`flex-1 py-2.5 rounded text-xs font-black transition-colors ${
            tab === "contact"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white"
          }`}
        >
          📞 Contact Us
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("feedback");
            setError(null);
            setSuccess(null);
          }}
          className={`flex-1 py-2.5 rounded text-xs font-black transition-colors ${
            tab === "feedback"
              ? "bg-[#DFFF00] text-[#000000] border border-[#111111]"
              : "text-[#666666] dark:text-[#A3A3A3] hover:text-[#111111] dark:hover:text-white"
          }`}
        >
          📝 Complaints &amp; Feedback
        </button>
      </div>

      {tab === "contact" ? (
        <div className="space-y-4">
          {/* Quick Call Card */}
          <div className="bg-[#000000] text-white p-5 rounded-lg border border-[#111111] dark:border-[#333333] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#DFFF00] text-[#000000]">
                Instant Care
              </span>
              <span className="text-[10px] text-[#A3A3A3]">Available 8:00 AM – 11:00 PM</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                RushD Customer Hotline
              </h2>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                Need urgent help with an active order or delivery issue?
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href="tel:+919244302120"
                className="py-2.5 px-4 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded font-black text-xs transition-colors text-center border border-[#111111] flex items-center justify-center gap-1.5"
              >
                <span>📞 Call +91 9244302120</span>
              </a>
              <a
                href="mailto:rushd.customercare@gmail.com"
                className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded font-bold text-xs transition-colors text-center border border-white/20 flex items-center justify-center gap-1.5"
              >
                <span>✉ Email Support</span>
              </a>
            </div>
          </div>

          {/* FAQ / Info Card */}
          <div className="bg-white dark:bg-[#141414] p-5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] space-y-3 text-xs shadow-xs">
            <h3 className="font-extrabold text-xs text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider">
              Common Inquiries
            </h3>
            <div className="space-y-2.5 text-[#333333] dark:text-[#CCCCCC]">
              <div className="p-3 bg-[#F5F5F5] dark:bg-[#1E1E1E] rounded border border-[#E5E5E5] dark:border-[#2C2C2C]">
                <p className="font-bold text-[#111111] dark:text-[#F5F5F5]">Where is my order?</p>
                <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">You can track your live rider location and delivery status under <Link href="/orders" className="text-[#111111] dark:text-[#DFFF00] font-bold underline">My Orders</Link>.</p>
              </div>
              <div className="p-3 bg-[#F5F5F5] dark:bg-[#1E1E1E] rounded border border-[#E5E5E5] dark:border-[#2C2C2C]">
                <p className="font-bold text-[#111111] dark:text-[#F5F5F5]">Damaged or Missing Item?</p>
                <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">Switch to the &quot;Complaints &amp; Feedback&quot; tab above and upload a photo of the item for an immediate resolution.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-lg border border-[#E5E5E5] dark:border-[#262626] space-y-4 shadow-xs">
          {error && (
            <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#D92D3A] border border-[#D92D3A] font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs rounded bg-white dark:bg-[#1A1A1A] text-[#168A55] border border-[#168A55] font-bold">
              ✓ {success}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block mb-1">Issue Category *</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "COMPLAINT", label: "Order Complaint", emoji: "⚠️" },
                { id: "FEEDBACK", label: "Feedback", emoji: "💡" },
                { id: "PRODUCT_REQUEST", label: "Item Request", emoji: "🛒" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setFeedbackType(t.id as typeof feedbackType)}
                  className={`py-2 px-1 rounded text-center font-extrabold text-[11px] border transition-colors ${
                    feedbackType === t.id
                      ? "bg-[#111111] dark:bg-[#333333] text-white border-[#111111] dark:border-[#555555]"
                      : "bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] border-[#E5E5E5] dark:border-[#262626]"
                  }`}
                >
                  <span className="block text-sm mb-0.5">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">Contact Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full px-3 py-2 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3]">Detailed Message *</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue, feedback, or the grocery product you want us to stock..."
              required
              className="w-full px-3.5 py-2.5 text-xs rounded border border-[#111111] dark:border-[#333333] bg-white dark:bg-[#1E1E1E] text-[#111111] dark:text-[#F5F5F5] placeholder-[#666666] dark:placeholder-[#777777] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
            />
          </div>

          {/* Photo Attachment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#666666] dark:text-[#A3A3A3] block">Photo Attachment (Optional, Max 5 MB)</label>
            {photoPreview ? (
              <div className="relative w-28 h-28 rounded-lg border border-[#111111] dark:border-[#333333] overflow-hidden bg-[#F5F5F5] dark:bg-[#1E1E1E]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Attached Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center text-xs font-bold"
                  aria-label="Remove Photo"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="feedbackPhotoInput"
                />
                <label
                  htmlFor="feedbackPhotoInput"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#F5F5F5] dark:bg-[#1E1E1E] hover:bg-gray-200 dark:hover:bg-[#2C2C2C] text-[#111111] dark:text-[#F5F5F5] border border-[#E5E5E5] dark:border-[#333333] text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>📷 Attach Photo</span>
                </label>
              </div>
            )}
            {photoError && <p className="text-[11px] font-bold text-[#D92D3A]">{photoError}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] rounded text-xs font-black transition-colors disabled:opacity-50 border border-[#111111] cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Ticket 🚀"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto space-y-4 pt-6 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-lg" />
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
