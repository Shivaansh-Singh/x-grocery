"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export interface Administrator {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface ManageAdminsModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageAdminsModal({ onClose, onSuccess }: ManageAdminsModalProps) {
  const { activeUser } = useAuth();
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [callerEmail, setCallerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add Admin state
  const [newEmail, setNewEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Remove Admin state
  const [adminToRemove, setAdminToRemove] = useState<Administrator | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAdministrators = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/administrators");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load store administrators.");
      }
      setAdministrators(data.administrators || []);
      if (data.callerId) setCallerId(data.callerId);
      if (data.callerEmail) setCallerEmail(data.callerEmail);
      setFetchError(null);
    } catch (err: unknown) {
      console.error("Error fetching administrators:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load store administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdministrators();
  }, [fetchAdministrators]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAdmin(true);
    setAddError(null);
    setAddSuccess(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAddError("Please enter an email address.");
      setAddingAdmin(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/administrators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to add administrator.");
      }

      setAddSuccess(data.message || `Administrator "${cleanEmail}" added successfully.`);
      setNewEmail("");
      showToast(data.message || "Administrator added successfully.");
      await fetchAdministrators();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Error adding administrator:", err);
      setAddError(err instanceof Error ? err.message : "Failed to add administrator.");
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!adminToRemove) return;
    setRemovingAdmin(true);
    setRemoveError(null);

    try {
      const res = await fetch(`/api/admin/administrators/${adminToRemove.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove administrator.");
      }

      const removedName = adminToRemove.name || adminToRemove.email;
      setAdminToRemove(null);
      showToast(data.message || `Administrator "${removedName}" removed and restored to customer.`);
      await fetchAdministrators();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Error removing administrator:", err);
      setRemoveError(err instanceof Error ? err.message : "Failed to remove administrator.");
    } finally {
      setRemovingAdmin(false);
    }
  };

  // Determine if target admin is the current caller
  const isCurrentAdmin = (admin: Administrator): boolean => {
    if (activeUser?.id && activeUser.id === admin.id) return true;
    if (activeUser?.email && activeUser.email.toLowerCase().trim() === admin.email.toLowerCase().trim()) return true;
    if (callerId && callerId === admin.id) return true;
    if (callerEmail && callerEmail.toLowerCase().trim() === admin.email.toLowerCase().trim()) return true;
    return false;
  };

  const isOnlyAdmin = administrators.length <= 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-lg border border-[#111111] max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh] text-[#111111] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E5E5] shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#111111] text-[#DFFF00] font-black flex items-center justify-center text-xs shrink-0 border border-[#111111]">
              ⚙
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#111111]">
                Manage Store Administrators
              </h3>
              <p className="text-[11px] text-[#666666] font-medium">
                Full administrative access to RushD operations & catalog
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5] cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Toast Banner */}
          {toastMessage && (
            <div className="p-3 bg-[#DFFF00] text-[#000000] border border-[#111111] rounded-lg text-xs font-black shadow-xs flex items-center justify-between animate-in fade-in">
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-[#000000] font-black text-xs hover:opacity-70 ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Section: Add Administrator */}
          <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#E5E5E5] space-y-3">
            <div>
              <h4 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                Add Store Administrator
              </h4>
              <p className="text-[11px] text-[#666666] font-medium mt-0.5">
                Promote an existing RushD customer to administrator
              </p>
            </div>

            {addError && (
              <div className="p-2.5 bg-red-50 border border-[#D92D3A] text-[#D92D3A] rounded text-xs font-bold">
                {addError}
              </div>
            )}

            {addSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-[#168A55] text-[#168A55] rounded text-xs font-bold">
                {addSuccess}
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Registered customer email address"
                  required
                  className="flex-1 px-3 py-2 rounded border border-[#111111] bg-white text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#DFFF00]"
                />
                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="px-4 py-2 bg-[#DFFF00] hover:bg-[#C8E600] text-[#000000] font-black text-xs rounded border border-[#111111] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {addingAdmin ? "Adding... ⏳" : "+ Add Admin"}
                </button>
              </div>
              <p className="text-[10px] text-[#666666] font-medium">
                ℹ️ The person must have signed into RushD at least once with this email before they can be promoted.
              </p>
            </form>
          </div>

          {/* Section: Current Administrators List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-[#111111] uppercase tracking-wider">
                Current Administrators ({administrators.length})
              </h4>
              <button
                type="button"
                onClick={fetchAdministrators}
                className="text-[11px] text-[#666666] hover:text-[#111111] font-bold cursor-pointer"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg" />
                ))}
              </div>
            ) : fetchError ? (
              <div className="p-4 bg-red-50 border border-red-200 text-[#D92D3A] rounded-lg text-xs font-bold text-center">
                {fetchError}
              </div>
            ) : (
              <div className="space-y-2">
                {administrators.map((admin) => {
                  const isSelf = isCurrentAdmin(admin);
                  const cannotRemove = isSelf || isOnlyAdmin;

                  return (
                    <div
                      key={admin.id}
                      data-testid={"admin-card-" + admin.id}
                      className="p-3.5 bg-white rounded-lg border border-[#E5E5E5] hover:border-[#111111] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded bg-[#111111] text-[#DFFF00] font-black flex items-center justify-center text-xs shrink-0 border border-[#111111]">
                          A
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-[#111111] truncate">
                              {admin.name || "Store Administrator"}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#DFFF00] text-[#000000] border border-[#111111]">
                              STORE ADMIN
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#111111] text-white">
                                (You)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#666666] block font-medium truncate mt-0.5">
                            {admin.email}
                            {admin.phone ? ` • ${admin.phone}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {cannotRemove ? (
                          <span
                            className="px-2.5 py-1 text-[11px] font-bold text-[#999999] bg-[#F5F5F5] rounded border border-[#E5E5E5] cursor-not-allowed"
                            title={
                              isSelf
                                ? "You cannot remove your own admin access."
                                : "You cannot remove the last store administrator."
                            }
                          >
                            {isSelf ? "Current Session" : "Last Admin"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setRemoveError(null);
                              setAdminToRemove(admin);
                            }}
                            className="px-3 py-1 bg-white hover:bg-red-50 text-[#DC2626] font-bold text-xs rounded border border-[#DC2626]/30 hover:border-[#DC2626] transition-colors cursor-pointer"
                          >
                            Remove Admin
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5E5] bg-[#F9F9F9] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal for Removing Admin */}
      {adminToRemove && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-[#111111] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-[#111111]">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-red-100 text-red-600 flex items-center justify-center text-sm font-black border border-red-200">
                  ⚠️
                </span>
                <h3 className="font-extrabold text-base text-[#111111]">
                  Remove Administrator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminToRemove(null)}
                disabled={removingAdmin}
                className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666] font-bold text-xs hover:text-[#111111] border border-[#E5E5E5] disabled:opacity-50 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {removeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-[#D92D3A] rounded-lg text-xs font-semibold">
                {removeError}
              </div>
            )}

            <div className="bg-[#F5F5F5] p-3.5 rounded-lg border border-[#E5E5E5] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#111111] text-sm">
                  {adminToRemove.name || "Store Administrator"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#DFFF00] text-[#000000] border border-[#111111]">
                  STORE ADMIN
                </span>
              </div>
              <p className="text-[#666666] font-medium">
                {adminToRemove.email}
              </p>
            </div>

            <div className="text-xs space-y-2 text-[#444444] bg-[#FFFBEB] p-3.5 rounded-lg border border-[#FDE68A]">
              <p className="font-bold text-[#92400E]">
                What happens when you remove this admin?
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78350F]">
                <li>Admin privileges will be revoked immediately.</li>
                <li>The user role will revert to standard <strong>CUSTOMER</strong>.</li>
                <li>All customer order history, addresses, and data remain preserved.</li>
                <li>The login account is <strong>not</strong> deleted.</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdminToRemove(null)}
                disabled={removingAdmin}
                className="flex-1 py-2.5 rounded border border-[#E5E5E5] text-[#666666] font-bold hover:bg-[#F5F5F5] text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={removingAdmin}
                className="flex-1 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black border border-[#B91C1C] text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {removingAdmin ? "Removing... ⏳" : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
