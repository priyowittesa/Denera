/** "2027-07-06" to "6 Jul 2027", or "Tue 6 Jul 2027" with the weekday. */
export function fmtDate(iso: string, weekday = false) {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d
    .toLocaleDateString('en-GB', { ...(weekday ? { weekday: 'short' as const } : {}), day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .replace(',', '')
}

/** Day of week for an ISO date: 0 Sunday to 6 Saturday. */
export const weekdayOf = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay()
