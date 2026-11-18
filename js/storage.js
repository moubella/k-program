export const STORAGE_KEY = "kprogram.lastDone";

const isFilledString = (value) => typeof value === "string" && value !== "";

export function loadLastDone(storage) {
  try {
    const record = JSON.parse(storage.getItem(STORAGE_KEY));
    if (record && isFilledString(record.sessionId) && isFilledString(record.date)) {
      return { sessionId: record.sessionId, date: record.date };
    }
  } catch {
    // Blocked, missing or corrupted storage: behave as if nothing was saved.
  }
  return null;
}

export function saveLastDone(storage, record) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: record.sessionId, date: record.date }));
  } catch {
    // Saving is a convenience; the app keeps working without it.
  }
}
