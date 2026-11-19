import { isValidIsoDate } from "./schedule.js";

export const OFFLINE_MESSAGE = "Couldn't load the program. Open the app once with internet.";
export const MISTAKE_MESSAGE = "The program file has a mistake in it. Ask for it to be fixed, then reopen the app.";

const isText = (value) => typeof value === "string" && value.trim() !== "";
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isTextList = (value) => Array.isArray(value) && value.every(isText);
const isNonEmptyList = (value, isItem) => Array.isArray(value) && value.length > 0 && value.every(isItem);

const isPhase = (p) => p !== null && typeof p === "object" && isNumber(p.fromWeek) && isNumber(p.sets) && isNumber(p.cardioMinutes);
// images is optional (no images = text-only card); when present: 1 still or a 2-frame loop.
const isImageList = (value) => value === undefined || (Array.isArray(value) && value.length >= 1 && value.length <= 2 && value.every(isText));
const isExercise = (e) =>
  e !== null && typeof e === "object" && ["name", "reps", "rest", "tip", "alt"].every((k) => isText(e[k])) && isImageList(e.images);
const isSession = (s) =>
  s !== null && typeof s === "object" && isText(s.id) && isText(s.name) && isNonEmptyList(s.exercises, isExercise);

// Everything render.js and app.js read from the program, so a bad edit shows a
// clear message instead of a blank page or "Week NaN".
export function isValidProgram(program) {
  return (
    program !== null &&
    typeof program === "object" &&
    isText(program.title) &&
    isValidIsoDate(program.startDate) &&
    isNumber(program.sessionMinutes) &&
    isNumber(program.warmupMinutes) &&
    isText(program.warmup) &&
    isText(program.cardio) &&
    isTextList(program.notes) &&
    isTextList(program.safety) &&
    isNonEmptyList(program.phases, isPhase) &&
    isNonEmptyList(program.sessions, isSession)
  );
}

// fetchProgram: () => Promise<Response>. Resolves to the program, or rejects
// with an Error whose message can be shown to her as-is.
export async function loadProgram(fetchProgram) {
  let response;
  try {
    response = await fetchProgram();
  } catch {
    throw new Error(OFFLINE_MESSAGE);
  }
  if (!response.ok) throw new Error(OFFLINE_MESSAGE);
  let program;
  try {
    program = await response.json();
  } catch {
    throw new Error(MISTAKE_MESSAGE);
  }
  if (!isValidProgram(program)) throw new Error(MISTAKE_MESSAGE);
  return program;
}
