export const SALON_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const;

export const PREDEFINED_TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
] as const;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000/api/v1";
