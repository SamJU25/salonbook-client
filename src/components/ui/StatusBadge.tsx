type SemanticStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "paid"
  | "unpaid"
  | "active"
  | "inactive"
  | "failed"
  | "blocked";

const STATUS_STYLES: Record<
  SemanticStatus,
  { label: string; classes: string }
> = {
  pending: {
    label: "Pending",
    classes:
      "bg-status-pending-bg text-status-pending-text border-status-pending-border",
  },
  confirmed: {
    label: "Confirmed",
    classes:
      "bg-status-confirmed-bg text-status-confirmed-text border-status-confirmed-border",
  },
  cancelled: {
    label: "Cancelled",
    classes:
      "bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border",
  },
  paid: {
    label: "Paid",
    classes: "bg-status-paid-bg text-status-paid-text border-status-paid-border",
  },
  unpaid: {
    label: "Unpaid",
    classes:
      "bg-status-unpaid-bg text-status-unpaid-text border-status-unpaid-border",
  },
  active: {
    label: "Active",
    classes:
      "bg-status-active-bg text-status-active-text border-status-active-border",
  },
  inactive: {
    label: "Inactive",
    classes:
      "bg-status-inactive-bg text-status-inactive-text border-status-inactive-border",
  },
  failed: {
    label: "Failed",
    classes:
      "bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border",
  },
  blocked: {
    label: "Blocked",
    classes:
      "bg-status-cancelled-bg text-status-cancelled-text border-status-cancelled-border",
  },
};

export function StatusBadge({ status }: { status: SemanticStatus }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
