import { format } from "date-fns";

/**
 * Format a timestamp for display in the UI
 * @param date - Date object or ISO string
 * @returns Formatted date string like "Friday, July 18, 2025 at 7:30 PM"
 */
export function formatConcertDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a");
}

/**
 * Format a timestamp for sorting and comparison
 * @param date - Date object or ISO string
 * @returns ISO string
 */
export function toISOString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Check if a concert date is in the future
 * @param date - Date object or ISO string
 * @returns boolean
 */
export function isFutureConcert(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

/**
 * Sort concerts by date (earliest first)
 * @param concerts - Array of concerts with date property
 * @returns Sorted array
 */
export function sortConcertsByDate<T extends { date: Date | string }>(concerts: T[]): T[] {
  return concerts.sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
    const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
    return dateA.getTime() - dateB.getTime();
  });
}