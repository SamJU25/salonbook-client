const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Formats monetary amounts consistently using en-US currency conventions.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  const code = currency.toUpperCase();
  if (code === "USD") {
    return usdFormatter.format(amount);
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)} ${code}`;
  }
}

/**
 * Formats an ISO timestamp into a consistent en-US calendar date.
 */
export function formatDateEnUS(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Formats an ISO timestamp into a consistent en-US date and time string.
 */
export function formatDateTimeEnUS(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
