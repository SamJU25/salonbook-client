/**
 * Custom editorial botanical arch & leaf emblem for SalonBook.
 */
export function BrandMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 20V11a7 7 0 0 1 14 0v9" />
      <path d="M12 19c0-4.5 2.5-7.5 6-8.5-.5 4-2.5 7-6 8.5Z" />
      <path d="M12 19c0-3.5-2-6-5-7 .4 3.2 2 5.6 5 7Z" />
    </svg>
  );
}
