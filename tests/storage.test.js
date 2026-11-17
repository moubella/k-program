import { test } from "node:test";
import assert from "node:assert/strict";
import { loadLastDone, saveLastDone } from "../js/storage.js";

function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

const throwingStorage = {
  getItem() {
    throw new Error("blocked");
  },
  setItem() {
    throw new Error("blocked");
  },
};

test("round-trips the last finished session", () => {
  const storage = fakeStorage();
  saveLastDone(storage, { sessionId: "B", date: "2026-11-30" });
  assert.deepEqual(loadLastDone(storage), { sessionId: "B", date: "2026-11-30" });
  assert.equal(storage.getItem("kprogram.lastDone"), '{"sessionId":"B","date":"2026-11-30"}');
});

test("returns null when nothing is stored", () => {
  assert.equal(loadLastDone(fakeStorage()), null);
});

test("returns null for garbage or incomplete data", () => {
  for (const raw of ["not json", "null", "42", '{"sessionId":"B"}', '{"sessionId":1,"date":"x"}', '{"sessionId":"","date":"x"}']) {
    assert.equal(loadLastDone(fakeStorage({ "kprogram.lastDone": raw })), null, raw);
  }
});

test("survives storage that throws or is missing", () => {
  assert.equal(loadLastDone(throwingStorage), null);
  assert.doesNotThrow(() => saveLastDone(throwingStorage, { sessionId: "A", date: "2026-11-23" }));
  assert.equal(loadLastDone(null), null);
  assert.doesNotThrow(() => saveLastDone(null, { sessionId: "A", date: "2026-11-23" }));
});
