"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  id: string;
  value: string;
  minDate: string;
  onChange: (nextDate: string) => void;
  disabled?: boolean;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function parseIsoDateUtc(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

function toIsoDateUtc(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysIso(iso: string, days: number): string {
  const dt = parseIsoDateUtc(iso);
  if (!dt) return iso;
  dt.setUTCDate(dt.getUTCDate() + days);
  return toIsoDateUtc(dt);
}

function formatTriggerDate(iso: string): string {
  const dt = parseIsoDateUtc(iso);
  if (!dt) return "Select date";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

function formatAccessibleDay(dt: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

function formatMonthHeading(year: number, monthIndex: number): string {
  const dt = new Date(Date.UTC(year, monthIndex, 1));
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(dt);
}

export function DatePicker({
  id,
  value,
  minDate,
  onChange,
  disabled = false,
}: DatePickerProps) {
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);

  const initialAnchor = useMemo(() => {
    const parsed = parseIsoDateUtc(value) ?? parseIsoDateUtc(minDate) ?? new Date();
    return {
      year: parsed.getUTCFullYear(),
      month: parsed.getUTCMonth(),
    };
  }, [value, minDate]);

  const [viewYear, setViewYear] = useState(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState(initialAnchor.month);

  const minMonthAnchor = useMemo(() => {
    const parsed = parseIsoDateUtc(minDate);
    if (!parsed) return null;
    return {
      year: parsed.getUTCFullYear(),
      month: parsed.getUTCMonth(),
    };
  }, [minDate]);

  const canGoPrevMonth = useMemo(() => {
    if (!minMonthAnchor) return true;
    return (
      viewYear > minMonthAnchor.year ||
      (viewYear === minMonthAnchor.year && viewMonth > minMonthAnchor.month)
    );
  }, [viewYear, viewMonth, minMonthAnchor]);

  const tomorrowIso = useMemo(() => addDaysIso(minDate, 1), [minDate]);

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

    const cells: Array<{
      key: string;
      dayNumber: number;
      iso: string;
      accessibleLabel: string;
      isDisabled: boolean;
    } | null> = [];

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dt = new Date(Date.UTC(viewYear, viewMonth, day));
      const iso = toIsoDateUtc(dt);
      cells.push({
        key: iso,
        dayNumber: day,
        iso,
        accessibleLabel: formatAccessibleDay(dt),
        isDisabled: Boolean(minDate && iso < minDate),
      });
    }

    return cells;
  }, [viewYear, viewMonth, minDate]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const active = parseIsoDateUtc(value) ?? parseIsoDateUtc(minDate);
    if (active) {
      setViewYear(active.getUTCFullYear());
      setViewMonth(active.getUTCMonth());
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenAbove(spaceBelow < 368 && spaceAbove > spaceBelow);
    }

    setIsOpen(true);
  };

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) return;
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (iso: string) => {
    if (minDate && iso < minDate) return;
    const parsed = parseIsoDateUtc(iso);
    if (parsed) {
      setViewYear(parsed.getUTCFullYear());
      setViewMonth(parsed.getUTCMonth());
    }
    onChange(iso);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const relativeTag =
    value === minDate ? "Today" : value === tomorrowIso ? "Tomorrow" : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={handleToggle}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-control border bg-surface px-3.5 text-left text-sm text-text transition focus-visible:outline-none ${
          isOpen
            ? "border-primary ring-2 ring-primary/15"
            : "border-border hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-medium">
            {formatTriggerDate(value)}
          </span>
          {relativeTag && (
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-primary">
              {relativeTag}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose appointment date"
          className={`absolute left-0 z-30 w-full rounded-card border border-border bg-surface p-4 shadow-dropdown sm:w-[336px] ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-semibold tracking-tight text-text">
              {formatMonthHeading(viewYear, viewMonth)}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoPrevMonth}
                onClick={handlePrevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-page/70 text-text transition hover:border-primary/40 hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:bg-page/70 disabled:hover:text-text"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={handleNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-page/70 text-text transition hover:border-primary/40 hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="mb-1.5 grid grid-cols-7 text-center"
            aria-hidden="true"
          >
            {WEEKDAY_LABELS.map((day) => (
              <span
                key={day}
                className="py-1 text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div key={`spacer-${idx}`} className="h-9" aria-hidden="true" />
                );
              }

              const isSelected = cell.iso === value;
              const isToday = cell.iso === minDate;

              return (
                <div
                  key={cell.key}
                  className="flex items-center justify-center"
                >
                  <button
                    type="button"
                    disabled={cell.isDisabled}
                    aria-label={cell.accessibleLabel}
                    aria-pressed={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => handleSelectDate(cell.iso)}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? "bg-primary font-semibold text-white shadow-sm hover:bg-primary-hover"
                        : cell.isDisabled
                          ? "cursor-not-allowed text-muted/35 line-through decoration-muted/25"
                          : isToday
                            ? "border border-primary/45 bg-secondary/75 font-semibold text-primary hover:bg-secondary"
                            : "font-medium text-text hover:bg-secondary hover:text-primary"
                    }`}
                  >
                    <span>{cell.dayNumber}</span>
                    {isToday && !isSelected && (
                      <span
                        className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectDate(minDate)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  value === minDate
                    ? "bg-primary text-white"
                    : "bg-secondary text-primary hover:bg-primary/15"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSelectDate(tomorrowIso)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  value === tomorrowIso
                    ? "bg-primary text-white"
                    : "bg-surface-muted text-text hover:bg-secondary hover:text-primary"
                }`}
              >
                Tomorrow
              </button>
            </div>
            <span className="text-[11px] font-medium text-muted">
              Seoul (KST)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
