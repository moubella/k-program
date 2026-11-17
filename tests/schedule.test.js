import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentWeek,
  formatShortDate,
  isValidIsoDate,
  nextSessionId,
  phaseForWeek,
  resolveToday,
  todayIso,
} from "../js/schedule.js";

test("currentWeek counts full 7-day blocks from the start date", () => {
  assert.equal(currentWeek("2026-11-23", "2026-11-23"), 1);
  assert.equal(currentWeek("2026-11-23", "2026-11-29"), 1);
  assert.equal(currentWeek("2026-11-23", "2026-11-30"), 2);
  assert.equal(currentWeek("2026-11-23", "2026-12-07"), 3);
});

test("currentWeek shows week 1 for a future start date", () => {
  assert.equal(currentWeek("2026-11-23", "2026-11-20"), 1);
});

test("currentWeek is not shifted by daylight-saving changes", () => {
  assert.equal(currentWeek("2026-03-23", "2026-03-30"), 2);
  assert.equal(currentWeek("2026-10-19", "2026-10-26"), 2);
});

test("phaseForWeek picks the last phase that has started", () => {
  const phases = [
    { fromWeek: 3, sets: 3, cardioMinutes: 15 },
    { fromWeek: 1, sets: 2, cardioMinutes: 10 },
  ];
  assert.equal(phaseForWeek(phases, 1).sets, 2);
  assert.equal(phaseForWeek(phases, 2).sets, 2);
  assert.equal(phaseForWeek(phases, 3).sets, 3);
  assert.equal(phaseForWeek(phases, 40).sets, 3);
});

test("nextSessionId rotates A → B → C → A", () => {
  const ids = ["A", "B", "C"];
  assert.equal(nextSessionId(ids, null), "A");
  assert.equal(nextSessionId(ids, "A"), "B");
  assert.equal(nextSessionId(ids, "B"), "C");
  assert.equal(nextSessionId(ids, "C"), "A");
});

test("nextSessionId falls back to the first session for an unknown id", () => {
  assert.equal(nextSessionId(["A", "B", "C"], "D"), "A");
});

test("isValidIsoDate accepts real dates and rejects malformed or impossible ones", () => {
  assert.equal(isValidIsoDate("2026-11-23"), true);
  assert.equal(isValidIsoDate("2028-02-29"), true);
  assert.equal(isValidIsoDate("2026-02-30"), false);
  assert.equal(isValidIsoDate("2026-13-01"), false);
  assert.equal(isValidIsoDate("2026-1-5"), false);
  assert.equal(isValidIsoDate("nope"), false);
});

test("todayIso gives the local calendar date, late in the evening too", () => {
  assert.equal(todayIso(new Date(2026, 10, 17, 23, 30)), "2026-11-17");
  assert.equal(todayIso(new Date(2026, 0, 5, 0, 10)), "2026-01-05");
});

test("resolveToday uses a valid ?today= override, else the local date", () => {
  const now = new Date(2026, 10, 17, 23, 30);
  assert.equal(resolveToday("?today=2026-12-07", now), "2026-12-07");
  assert.equal(resolveToday("?today=nope", now), "2026-11-17");
  assert.equal(resolveToday("?today=2026-02-30", now), "2026-11-17");
  assert.equal(resolveToday("", now), "2026-11-17");
});

test("formatShortDate gives weekday, day, month in English", () => {
  assert.equal(formatShortDate("2026-11-30"), "Mon 30 Nov");
  assert.equal(formatShortDate("2026-12-05"), "Sat 5 Dec");
  assert.equal(formatShortDate("2027-01-03"), "Sun 3 Jan");
});
