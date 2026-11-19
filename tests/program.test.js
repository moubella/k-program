import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const program = JSON.parse(fs.readFileSync(new URL("../program.json", import.meta.url), "utf8"));

test("has sessions A, B, C with the spec's names", () => {
  assert.deepEqual(program.sessions.map((s) => [s.id, s.name]), [
    ["A", "Glutes & hamstrings"],
    ["B", "Legs & back"],
    ["C", "Glutes & full body"],
  ]);
});

test("has the spec's exercises in order", () => {
  assert.deepEqual(program.sessions.map((s) => s.exercises.map((e) => e.name)), [
    [
      "Hip thrust (machine, or Smith machine)",
      "Dumbbell Romanian deadlift",
      "Seated leg curl (machine)",
      "Cable glute kickback",
      "Hip abduction machine",
    ],
    ["Goblet squat", "Leg press, feet high and wide", "Lat pulldown", "Seated cable row", "Plank"],
    [
      "Hip thrust (machine, or Smith machine)",
      "Dumbbell reverse lunge",
      "45° back extension, glute focus",
      "Chest press machine",
      "Seated dumbbell shoulder press",
    ],
  ]);
});

test("every exercise has non-empty reps, rest, tip and alt", () => {
  for (const session of program.sessions) {
    for (const exercise of session.exercises) {
      for (const field of ["reps", "rest", "tip", "alt"]) {
        assert.equal(typeof exercise[field], "string", `${session.id} ${exercise.name}: ${field} missing`);
        assert.ok(exercise[field].trim(), `${session.id} ${exercise.name}: ${field} empty`);
      }
    }
  }
});

test("spot-checks exact values", () => {
  const [a, b] = program.sessions;
  assert.deepEqual([a.exercises[0].reps, a.exercises[0].rest], ["10–12", "90 s"]);
  assert.equal(a.exercises[3].reps, "12 per leg");
  assert.equal(b.exercises[4].reps, "20–30 s");
});

test("phases and start date match the spec", () => {
  assert.deepEqual(program.phases, [
    { fromWeek: 1, sets: 2, cardioMinutes: 10, message: "Learning weeks: light weights, focus on form" },
    { fromWeek: 3, sets: 3, cardioMinutes: 15 },
  ]);
  assert.match(program.startDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!Number.isNaN(Date.parse(program.startDate)));
});

test("every exercise shows 1 or 2 images that exist", () => {
  for (const session of program.sessions) {
    for (const exercise of session.exercises) {
      const label = `${session.id} ${exercise.name}`;
      assert.ok(Array.isArray(exercise.images), `${label}: images missing`);
      assert.ok(exercise.images.length >= 1 && exercise.images.length <= 2, `${label}: needs 1 or 2 images`);
      for (const src of exercise.images) {
        assert.match(src, /^images\/[a-z0-9-]+\.jpg$/, `${label}: ${src}`);
        assert.ok(fs.existsSync(new URL(`../${src}`, import.meta.url)), `${label}: ${src} not found`);
      }
    }
  }
});

test("the plank is a still image and the hip thrust uses the same photos in A and C", () => {
  const [a, b, c] = program.sessions;
  assert.deepEqual(b.exercises[4].images, ["images/plank-0.jpg"]);
  assert.deepEqual(a.exercises[0].images, ["images/hip-thrust-0.jpg", "images/hip-thrust-1.jpg"]);
  assert.deepEqual(c.exercises[0].images, a.exercises[0].images);
});
