// src/lib/format-date.ts

/** "2026-11-26", "2026-11", or a timestamp that starts with a calendar date. */
const CALENDAR_DATE = /^(\d{4})-(\d{2})(?:-(\d{2}))?/;

/**
 * Formats a content date as the calendar day it names.
 *
 * `new Date("2026-11-26")` is midnight UTC. Formatting that in local time
 * shows Nov 25 to anyone west of UTC, and client components format in the
 * visitor's time zone. So the date is built in UTC and formatted in UTC, with
 * a fixed locale, which also keeps server and browser output identical.
 */
export function formatContentDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string | null {
  if (!value) return null;
  const m = CALENDAR_DATE.exec(value.trim());
  const date = m
    ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}
