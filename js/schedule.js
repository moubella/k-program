const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Dates are "YYYY-MM-DD" strings. All arithmetic goes through Date.UTC so
// daylight-saving changes in the phone's timezone never shift a day.
function toUtcMs(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

const pad = (n) => String(n).padStart(2, "0");

export function isValidIsoDate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(toUtcMs(iso));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}` === iso;
}

export function todayIso(now) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function resolveToday(search, now) {
  const override = new URLSearchParams(search).get("today");
  return isValidIsoDate(override) ? override : todayIso(now);
}

export function addDays(iso, days) {
  const date = new Date(toUtcMs(iso) + days * DAY_MS);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Week 0 (cardio only) starts on the start date; the A/B/C sessions start at week 1.
export function currentWeek(startDate, today) {
  const days = Math.round((toUtcMs(today) - toUtcMs(startDate)) / DAY_MS);
  return days < 0 ? 0 : Math.floor(days / 7);
}

export function phaseForWeek(phases, week) {
  const started = phases.filter((p) => p.fromWeek <= week).sort((a, b) => a.fromWeek - b.fromWeek);
  if (started.length) return started[started.length - 1];
  return phases.reduce((earliest, p) => (p.fromWeek < earliest.fromWeek ? p : earliest));
}

export function nextSessionId(sessionIds, lastDoneId) {
  const index = sessionIds.indexOf(lastDoneId);
  return index === -1 ? sessionIds[0] : sessionIds[(index + 1) % sessionIds.length];
}

export function formatShortDate(iso) {
  const date = new Date(toUtcMs(iso));
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}
