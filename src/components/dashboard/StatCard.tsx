export function StatCard({
  label,
  value,
  icon: Icon,
  helper,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-secondary text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      {helper && <p className="mt-2.5 text-xs text-muted">{helper}</p>}
    </div>
  );
}
