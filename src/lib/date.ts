// Deterministic date formatting helpers for SSR/CSR parity
// Avoid relying on locale-specific punctuation (e.g., commas) and fix timeZone.

export type DateParts = {
  weekday: string; // e.g., "Friday"
  dateText: string; // e.g., "17 October 2025"
};

/**
 * Formats a date into stable parts across server and client using a fixed timeZone.
 * - Uses en-GB locale for consistent month/weekday names
 * - Uses formatToParts to avoid locale-specific commas/literals
 */
export function formatDateParts(date: Date, options?: { timeZone?: string }): DateParts {
  const timeZone = options?.timeZone ?? 'UTC';
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const year = parts.find((p) => p.type === 'year')?.value ?? '';

  const dateText = [day, month, year].filter(Boolean).join(' ');
  return { weekday, dateText };
}
