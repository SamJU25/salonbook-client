/**
 * Validates that a YYYY-MM-DD string represents a real calendar date (rejects e.g. 2026-02-30).
 */
export function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Parses a predefined 12-hour slot string (e.g. "01:30 PM") into minutes since midnight.
 */
export function parseTimeSlotMinutes(slot: string): number {
  const match = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(slot);
  if (!match) return -1;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}
