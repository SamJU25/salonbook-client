"use client";

import { Eye, ShieldBan, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Loader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import type { SalonUser } from "@/types";

interface UserDetailsWithStats extends SalonUser {
  appointmentStats?: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
}

export default function AdminManageUsersPage() {
  const [users, setUsers] = useState<SalonUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [detailUser, setDetailUser] = useState<UserDetailsWithStats | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [blockTarget, setBlockTarget] = useState<SalonUser | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonUser[]>("/admin/users");
      setUsers(data || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load registered users"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleViewDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const data = await apiRequest<UserDetailsWithStats>(`/admin/users/${userId}`);
      setDetailUser(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load user details"
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleConfirmToggleBlock = async () => {
    if (!blockTarget) return;
    const targetId = blockTarget._id || blockTarget.id;
    const nextBlocked = !blockTarget.isBlocked;

    setIsToggling(true);
    try {
      await apiRequest(`/admin/users/${targetId}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: nextBlocked }),
      });

      setUsers((prev) =>
        prev.map((u) =>
          (u._id || u.id) === targetId ? { ...u, isBlocked: nextBlocked } : u
        )
      );
      toast.success(
        nextBlocked ? "Customer blocked successfully" : "Customer unblocked successfully"
      );
      setBlockTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update user status"
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading registered customers..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Manage Users</h1>
        <p className="mt-1 text-sm text-muted">
          View registered customers and manage platform access.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center shadow-xs">
          <p className="text-base font-semibold text-text">
            No registered customers yet.
          </p>
        </div>
      ) : (
        <>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="admin-users-caption"
            className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs md:block"
          >
            <table className="w-full border-collapse text-left text-sm">
              <caption id="admin-users-caption" className="sr-only">
                Registered SalonBook customers
              </caption>
              <thead className="border-b border-border bg-surface-muted/70 text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const uid = u._id || u.id;
                  return (
                    <tr key={uid} className="hover:bg-surface-muted/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={u.image}
                              alt={u.name}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="font-semibold text-text">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{u.email}</td>
                      <td className="px-4 py-3.5 text-muted">{u.phone || "—"}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={u.isBlocked ? "blocked" : "active"} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isLoadingDetails}
                            onClick={() => handleViewDetails(uid)}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            Details
                          </Button>

                          {u.isBlocked ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setBlockTarget(u)}
                            >
                              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBlockTarget(u)}
                              className="border-[#F0C8C4] text-[#9A352E] hover:bg-status-cancelled-bg"
                            >
                              <ShieldBan className="h-4 w-4" aria-hidden="true" />
                              Block
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {users.map((u) => {
              const uid = u._id || u.id;
              return (
                <article
                  key={uid}
                  className="rounded-card border border-border bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-text">{u.name}</h2>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                    <StatusBadge status={u.isBlocked ? "blocked" : "active"} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewDetails(uid)}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      variant={u.isBlocked ? "primary" : "outline"}
                      onClick={() => setBlockTarget(u)}
                      className={
                        u.isBlocked ? "" : "border-[#F0C8C4] text-[#9A352E]"
                      }
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <ModalDialog
        open={Boolean(detailUser)}
        title="Customer Details"
        onClose={() => setDetailUser(null)}
      >
        {detailUser && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Full Name</span>
              <span className="font-semibold text-text">{detailUser.name}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Email</span>
              <span className="text-text">{detailUser.email}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Phone</span>
              <span className="text-text">{detailUser.phone || "Not set"}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Account Status</span>
              <StatusBadge status={detailUser.isBlocked ? "blocked" : "active"} />
            </div>
            {detailUser.appointmentStats && (
              <div className="rounded-control bg-page p-3.5">
                <p className="text-xs font-bold tracking-wide text-muted uppercase">
                  Appointment Summary
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <span>Total: {detailUser.appointmentStats.total}</span>
                  <span>Pending: {detailUser.appointmentStats.pending}</span>
                  <span>Confirmed: {detailUser.appointmentStats.confirmed}</span>
                  <span>Cancelled: {detailUser.appointmentStats.cancelled}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title={
          blockTarget?.isBlocked ? "Unblock this customer?" : "Block this customer?"
        }
        description={
          blockTarget?.isBlocked
            ? `Restores protected booking and dashboard access for ${blockTarget?.name}.`
            : `Blocking ${blockTarget?.name} immediately prevents them from accessing protected routes, booking appointments, or making payments.`
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock user" : "Block user"}
        cancelLabel="Cancel"
        destructive={!blockTarget?.isBlocked}
        isLoading={isToggling}
        onConfirm={handleConfirmToggleBlock}
        onClose={() => setBlockTarget(null)}
      />
    </div>
  );
}
