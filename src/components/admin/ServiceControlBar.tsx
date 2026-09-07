"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export function ServiceControlBar() {
  const { session } = useAuth();
  const [isPaused, setIsPaused] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/service-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setIsPaused(Boolean(data.isPaused));
      }
    } catch (err) {
      console.error("Failed to fetch service status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const handleStatusChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPaused: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.isPaused === "boolean") {
        setIsPaused(customEvent.detail.isPaused);
      }
    };

    window.addEventListener("rushd:service-status-changed", handleStatusChanged);
    return () => {
      window.removeEventListener("rushd:service-status-changed", handleStatusChanged);
    };
  }, [fetchStatus]);

  const handleTogglePause = async (targetPaused: boolean) => {
    setActionLoading(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/admin/service-status", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ isPaused: targetPaused }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update service status");
      }

      const newPausedState = Boolean(data.isPaused);
      setIsPaused(newPausedState);
      setIsModalOpen(false);

      window.dispatchEvent(
        new CustomEvent("rushd:service-status-changed", {
          detail: { isPaused: newPausedState },
        })
      );

      showToast(
        newPausedState
          ? "Services paused. RushD is not accepting new orders."
          : "Services resumed. RushD is now accepting orders."
      );
    } catch (err) {
      console.error("Error updating service status:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to change service state"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div
        className={`p-3.5 rounded-lg border transition-all ${
          isPaused
            ? "bg-[#FFFBEB] border-[#F59E0B] text-[#92400E]"
            : "bg-[#FAFAFA] border-[#E5E5E5] text-black"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5">
            {loading ? (
              <span className="w-2.5 h-2.5 rounded-full bg-[#CCCCCC] animate-pulse shrink-0" />
            ) : isPaused ? (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D97706]" />
              </span>
            ) : (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#168A55] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#168A55]" />
              </span>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className={`font-black text-xs uppercase tracking-wider ${isPaused ? "" : "text-black !text-black"}`}>
                  {loading
                    ? "Checking Services..."
                    : isPaused
                    ? "Services Paused"
                    : "Services Active"}
                </span>

                {!loading && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                      isPaused
                        ? "bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]"
                        : "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]"
                    }`}
                  >
                    {isPaused ? "STOPPED" : "LIVE"}
                  </span>
                )}
              </div>

              <p className={`text-[11px] font-medium mt-0.5 ${isPaused ? "text-[#666666]" : "text-[#333333] !text-[#333333]"}`}>
                {isPaused
                  ? "New customer orders are temporarily blocked. Browsing and existing orders remain active."
                  : "All customer checkout and store ordering operations are online."}
              </p>
            </div>
          </div>

          {/* Action Control Button */}
          <div className="shrink-0 flex items-center gap-2">
            {!loading && (
              <>
                {isPaused ? (
                  <button
                    type="button"
                    onClick={() => handleTogglePause(false)}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded text-xs font-black bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] border border-[#111111] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {actionLoading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Resuming...</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Resume Services</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setIsModalOpen(true);
                    }}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 rounded text-xs font-extrabold bg-white hover:bg-[#F5F5F5] text-[#111111] border border-[#111111] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <span>⏸</span>
                    <span>Pause Services</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Feedback / Error notifications */}
        {errorMessage && (
          <div className="mt-2.5 p-2 bg-[#FEE2E2] border border-[#FCA5A5] rounded text-xs text-[#B91C1C] font-semibold">
            {errorMessage}
          </div>
        )}
        {toastMessage && (
          <div className="mt-2.5 p-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded text-xs text-[#065F46] font-semibold">
            {toastMessage}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Pausing Services */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-xl border border-[#111111] max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] mb-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h3 className="font-extrabold text-lg text-[#111111] tracking-tight">
                Pause RushD services?
              </h3>

              <p className="text-xs text-[#666666] leading-relaxed font-medium">
                Customers will still be able to browse RushD, but new orders will be temporarily unavailable.
              </p>
            </div>

            <div className="p-3 bg-[#F9FAFB] border border-[#E5E5E5] rounded-lg text-[11px] text-[#4B5563] space-y-1">
              <div className="font-bold text-[#111111]">Operational behavior:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Active in-progress deliveries will continue normally.</li>
                <li>Customer cart items will remain intact.</li>
                <li>Services can be resumed at any time with one click.</li>
              </ul>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded text-xs text-[#B91C1C] font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded text-xs font-bold border border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F5F5F5] hover:text-[#111111] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleTogglePause(true)}
                disabled={actionLoading}
                className="px-4 py-2 rounded text-xs font-black bg-[#D92D3A] hover:bg-[#B91C1C] text-white border border-[#D92D3A] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {actionLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Pausing...</span>
                  </>
                ) : (
                  <span>Pause Services</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
