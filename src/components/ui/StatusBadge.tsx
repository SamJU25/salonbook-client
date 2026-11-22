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
  { label: string; dotClass: string; textClass: string }
> = {
  pending: {
    label: "Pending",
    dotClass: "bg-[#B87A14]",
    textClass: "text-status-pending-text",
  },
  confirmed: {
    label: "Confirmed",
    dotClass: "bg-[#24583B]",
    textClass: "text-status-confirmed-text",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-[#9A352E]",
    textClass: "text-status-cancelled-text",
  },
  paid: {
    label: "Paid",
    dotClass: "bg-[#205B55]",
    textClass: "text-status-paid-text",
  },
  unpaid: {
    label: "Unpaid",
    dotClass: "bg-[#B87A14]",
    textClass: "text-status-unpaid-text",
  },
  active: {
    label: "Active",
    dotClass: "bg-[#24583B]",
    textClass: "text-status-active-text",
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-[#8A918B]",
    textClass: "text-status-inactive-text",
  },
  failed: {
    label: "Failed",
    dotClass: "bg-[#9A352E]",
    textClass: "text-status-cancelled-text",
  },
  blocked: {
    label: "Blocked",
    dotClass: "bg-[#9A352E]",
    textClass: "text-status-cancelled-text",
  },
};

export function StatusBadge({ status }: { status: SemanticStatus }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold leading-5 ${config.textClass}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClass}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
