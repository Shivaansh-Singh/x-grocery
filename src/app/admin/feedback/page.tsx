"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface CustomerFeedbackItem {
  id: string;
  customerId?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  type: "COMPLAINT" | "FEEDBACK" | "PRODUCT_REQUEST";
  message: string;
  imageUrl?: string | null;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
}

interface FeedbackCounts {
  total: number;
  newCount: number;
  inProgressCount: number;
  resolvedCount: number;
  complaintsCount: number;
  feedbackCount: number;
  productRequestsCount: number;
}

function AdminFeedbackContent() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedbackItem[]>([]);
  const [counts, setCounts] = useState<FeedbackCounts>({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
    complaintsCount: 0,
    feedbackCount: 0,
    productRequestsCount: 0,
  });
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState<string>("");
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchFeedbacks = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === "NEW" || activeTab === "IN_PROGRESS" || activeTab === "RESOLVED") {
        params.set("status", activeTab);
      } else if (activeTab === "COMPLAINT" || activeTab === "FEEDBACK" || activeTab === "PRODUCT_REQUEST") {
        params.set("type", activeTab);
      }
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const res = await fetch(`/api/admin/feedback?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch customer feedback");
      }

      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      console.error("Error loading feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!ignore) {
        await fetchFeedbacks();
      }
    }
    load();

    const interval = setInterval(() => {
      fetchFeedbacks(true);
    }, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchFeedbacks]);

  const handleUpdateStatus = async (id: string, newStatus: "NEW" | "IN_PROGRESS" | "RESOLVED") => {
    setUpdatingId(id);
    // Optimistic UI update
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );

    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      showToast(`Status updated to ${newStatus.replace("_", " ")}.`);
      fetchFeedbacks(true);
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Error updating feedback status.");
      fetchFeedbacks(false);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notesInput }),
      });

      if (res.ok) {
        showToast("Admin notes saved.");
        setEditingNotesId(null);
        fetchFeedbacks(true);
      }
    } catch (err) {
      console.error("Error saving notes:", err);
    }
  };

  const tabs = [
    { key: "ALL", label: `All (${counts.total})` },
    { key: "NEW", label: `New (${counts.newCount})`, badge: counts.newCount > 0 },
    { key: "IN_PROGRESS", label: `In Progress (${counts.inProgressCount})` },
    { key: "RESOLVED", label: `Resolved (${counts.resolvedCount})` },
    { key: "COMPLAINT", label: `Complaints (${counts.complaintsCount})` },
    { key: "FEEDBACK", label: `Feedback (${counts.feedbackCount})` },
    { key: "PRODUCT_REQUEST", label: `Product Requests (${counts.productRequestsCount})` },
  ];

  return (
    <div className="space-y-4 pt-1 pb-10 text-[#111111]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] max-w-sm bg-[#111111] text-[#DFFF00] text-xs font-bold px-4 py-3 rounded-lg border border-[#DFFF00] shadow-2xl animate-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Admin Navigation Header */}
      <AdminHeader />

      {/* Page Heading */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2.5">
        <div>
          <h1 className="font-extrabold text-xl text-[#111111] tracking-tight">
            Customer Feedback &amp; Complaints
          </h1>
          <p className="text-xs text-[#666666] font-medium">
            Review customer inquiries, issue complaints, suggestions, and product requests
          </p>
        </div>
        <Link
          href="/admin"
          className="text-xs font-bold text-[#666666] hover:text-[#111111] px-3 py-1.5 rounded border border-[#E5E5E5]"
        >
          ← Admin Hub
        </Link>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
            Total Submissions
          </span>
          <span className="text-xl font-black text-[#111111] mt-1">
            {counts.total}
          </span>
        </div>

        <div className={`p-3 rounded-lg border transition-colors flex flex-col justify-between ${
          counts.newCount > 0 ? "bg-[#DFFF00] border-[#111111]" : "bg-white border-[#E5E5E5]"
        }`}>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#000000]">
            Action Needed (New)
          </span>
          <span className="text-xl font-black text-[#000000] mt-1">
            {counts.newCount}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider">
            In Progress
          </span>
          <span className="text-xl font-black text-[#111111] mt-1">
            {counts.inProgressCount}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E5E5E5] flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-[#168A55] uppercase tracking-wider">
            Resolved
          </span>
          <span className="text-xl font-black text-[#168A55] mt-1">
            {counts.resolvedCount}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E5E5]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, email, or message..."
          className="w-full px-3 py-2 text-xs rounded border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded text-xs font-black transition-colors shrink-0 relative border ${
              activeTab === tab.key
                ? "bg-[#DFFF00] text-[#000000] border-[#111111]"
                : "text-[#666666] hover:text-[#111111] border-transparent"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1 py-0.2 text-[9px] bg-[#D92D3A] text-white rounded font-black">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-[#E5E5E5] text-center space-y-2">
          <h3 className="font-extrabold text-sm text-[#111111]">
            No customer feedback found
          </h3>
          <p className="text-xs text-[#666666] max-w-xs mx-auto font-medium">
            Customer inquiries and complaints will appear here automatically when submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((item) => {
            const customerName = item.customer?.name || item.name || "Customer";
            const customerContact = item.customer?.phone || item.phone || item.customer?.email || item.email || "No contact info";
            const isComplaint = item.type === "COMPLAINT";
            const isProductReq = item.type === "PRODUCT_REQUEST";

            const formattedDate = new Date(item.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className={`bg-white p-4 rounded-lg border space-y-3 transition-colors ${
                  item.status === "NEW" ? "border-[#111111] shadow-xs" : "border-[#E5E5E5]"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#E5E5E5] pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isComplaint
                          ? "bg-[#D92D3A] text-white"
                          : isProductReq
                          ? "bg-[#111111] text-[#DFFF00]"
                          : "bg-[#DFFF00] text-[#000000] border border-[#111111]"
                      }`}>
                        {item.type.replace("_", " ")}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.status === "RESOLVED"
                          ? "bg-[#168A55] text-white"
                          : item.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {item.status.replace("_", " ")}
                      </span>

                      <span className="text-[10px] text-[#666666] font-medium">
                        • {formattedDate}
                      </span>

                      {item.imageUrl && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#DFFF00] text-[#000000] border border-[#111111] flex items-center gap-1">
                          <span>📷</span>
                          <span>Photo Attached</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      <span className="text-xs font-extrabold text-[#111111]">
                        Customer: {customerName}
                      </span>
                      <span className="text-xs text-[#666666] font-medium block">
                        Contact: {customerContact}
                      </span>
                    </div>
                  </div>

                  {/* Status update buttons */}
                  <div className="flex items-center gap-1.5 self-start shrink-0">
                    <span className="text-[10px] font-bold text-[#666666] mr-1">Status:</span>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "NEW")}
                      disabled={updatingId === item.id || item.status === "NEW"}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        item.status === "NEW"
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-[#F5F5F5] text-[#666666] border-[#E5E5E5] hover:border-[#111111]"
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "IN_PROGRESS")}
                      disabled={updatingId === item.id || item.status === "IN_PROGRESS"}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        item.status === "IN_PROGRESS"
                          ? "bg-[#111111] text-white border-[#111111]"
                          : "bg-[#F5F5F5] text-[#666666] border-[#E5E5E5] hover:border-[#111111]"
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                      disabled={updatingId === item.id || item.status === "RESOLVED"}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                        item.status === "RESOLVED"
                          ? "bg-[#168A55] text-white border-[#168A55]"
                          : "bg-[#F5F5F5] text-[#666666] border-[#E5E5E5] hover:border-[#111111]"
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-[#F5F5F5] p-3 rounded border border-[#E5E5E5] text-xs">
                  <span className="text-[10px] font-extrabold text-[#666666] uppercase tracking-wider block mb-1">
                    Customer Message:
                  </span>
                  <p className="text-xs text-[#111111] font-medium whitespace-pre-wrap leading-relaxed">
                    {item.message}
                  </p>
                </div>

                {/* Photo Attachment (If present) */}
                {item.imageUrl && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded bg-white border border-[#E5E5E5]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt="Customer attached photo"
                        className="w-12 h-12 rounded object-cover border border-[#111111] bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                        onClick={() => setViewingPhotoUrl(item.imageUrl || null)}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold text-[#111111] uppercase tracking-wider block">
                          Photo Attachment
                        </span>
                        <span className="text-[11px] text-[#666666] font-medium truncate block">
                          Customer uploaded proof / photo
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingPhotoUrl(item.imageUrl || null)}
                      className="px-3 py-1.5 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs rounded border border-[#111111] transition-colors inline-flex items-center gap-1 shrink-0"
                    >
                      <span>View Photo</span>
                      <span>↗</span>
                    </button>
                  </div>
                )}

                {/* Admin Internal Notes (Optional) */}
                <div className="text-xs pt-1">
                  {editingNotesId === item.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add internal resolution notes or action taken..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-[#111111] bg-white text-[#111111] focus:outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveNotes(item.id)}
                          className="px-2.5 py-1 bg-[#111111] text-white rounded text-[10px] font-bold"
                        >
                          Save Notes
                        </button>
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 bg-[#F5F5F5] text-[#666666] rounded text-[10px] font-bold border border-[#E5E5E5]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-[#666666]">
                      <span>
                        {item.adminNotes ? (
                          <span className="font-medium">
                            📝 <strong className="text-[#111111]">Internal Note:</strong> {item.adminNotes}
                          </span>
                        ) : (
                          <span className="italic">No internal notes added.</span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setEditingNotesId(item.id);
                          setNotesInput(item.adminNotes || "");
                        }}
                        className="font-bold text-[#111111] hover:underline"
                      >
                        {item.adminNotes ? "Edit Note" : "+ Add Note"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {viewingPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div
            className="bg-white rounded-lg border border-[#111111] p-4 max-w-xl w-full space-y-3 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
              <span className="font-extrabold text-xs text-[#111111]">
                Customer Photo Attachment
              </span>
              <button
                onClick={() => setViewingPhotoUrl(null)}
                className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-xs font-bold text-[#666666] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded border border-[#E5E5E5] bg-black/5">
              <img
                src={viewingPhotoUrl}
                alt="Full customer attachment"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <a
                href={viewingPhotoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#111111] hover:underline"
              >
                Open in new tab ↗
              </a>
              <button
                onClick={() => setViewingPhotoUrl(null)}
                className="px-3 py-1.5 bg-[#111111] text-white rounded text-xs font-bold hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 pt-4 animate-pulse">
          <div className="h-10 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
          <div className="h-64 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
        </div>
      }
    >
      <AdminFeedbackContent />
    </Suspense>
  );
}
