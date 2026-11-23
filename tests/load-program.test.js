import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isValidProgram, loadProgram, MISTAKE_MESSAGE, OFFLINE_MESSAGE } from "../js/program.js";

const VALID = JSON.parse(fs.readFileSync(new URL("../program.json", import.meta.url), "utf8"));
const copy = () => structuredClone(VALID);

test("the real program.json is valid", () => {
  assert.equal(isValidProgram(VALID), true);
});

test("programs that would crash or mislead the app are rejected", () => {
  const broken = {
    "not an object": null,
    "missing startDate": (() => { const p = copy(); delete p.startDate; return p; })(),
    "startDate in the wrong format": { ...copy(), startDate: "23/11/2026" },
    "no phases": { ...copy(), phases: [] },
    "phase without sets": { ...copy(), phases: [{ fromWeek: 1, cardioMinutes: 10 }] },
    "no sessions": { ...copy(), sessions: [] },
    "session without exercises": { ...copy(), sessions: [{ id: "A", name: "Glutes", exercises: [] }] },
    "exercise without reps": (() => { const p = copy(); delete p.sessions[0].exercises[0].reps; return p; })(),
    "missing notes": (() => { const p = copy(); delete p.notes; return p; })(),
    "missing safety": (() => { const p = copy(); delete p.safety; return p; })(),
    "missing warm-up": (() => { const p = copy(); delete p.warmup; return p; })(),
    "missing cardio": (() => { const p = copy(); delete p.cardio; return p; })(),
    "images not a list": (() => { const p = copy(); p.sessions[0].exercises[0].images = "images/a.jpg"; return p; })(),
    "empty images list": (() => { const p = copy(); p.sessions[0].exercises[0].images = []; return p; })(),
    "three images": (() => { const p = copy(); p.sessions[0].exercises[0].images = ["a.jpg", "b.jpg", "c.jpg"]; return p; })(),
    "missing week 0": (() => { const p = copy(); delete p.week0; return p; })(),
    "week 0 without a message": (() => { const p = copy(); delete p.week0.message; return p; })(),
    "week 0 without machines": (() => { const p = copy(); p.week0.machines = []; return p; })(),
    "machine without settings": (() => { const p = copy(); delete p.week0.machines[0].settings; return p; })(),
    "machine minutes as text": (() => { const p = copy(); p.week0.machines[0].minutes = "15"; return p; })(),
    "machine images not a list": (() => { const p = copy(); p.week0.machines[0].images = "images/a.jpg"; return p; })(),
  };
  for (const [label, program] of Object.entries(broken)) {
    assert.equal(isValidProgram(program), false, label);
  }
});

test("an exercise without images is still valid (shown like v1)", () => {
  const p = copy();
  delete p.sessions[0].exercises[0].images;
  assert.equal(isValidProgram(p), true);
});

test("a week 0 machine with images is valid", () => {
  const p = copy();
  p.week0.machines[0].images = ["images/treadmill-0.jpg", "images/treadmill-1.jpg"];
  assert.equal(isValidProgram(p), true);
});

test("loadProgram returns the program from a good response", async () => {
  const program = await loadProgram(async () => new Response(JSON.stringify(VALID)));
  assert.equal(program.title, "K Program");
});

test("loadProgram explains a network failure or HTTP error as being offline", async () => {
  await assert.rejects(loadProgram(async () => { throw new TypeError("Failed to fetch"); }), { message: OFFLINE_MESSAGE });
  await assert.rejects(loadProgram(async () => new Response("nope", { status: 404 })), { message: OFFLINE_MESSAGE });
  assert.equal(OFFLINE_MESSAGE, "Couldn't load the program. Open the app once with internet.");
});

test("loadProgram explains broken JSON or a bad shape as a mistake in the program", async () => {
  await assert.rejects(loadProgram(async () => new Response("{ broken")), { message: MISTAKE_MESSAGE });
  await assert.rejects(loadProgram(async () => new Response('{"sessions":[]}')), { message: MISTAKE_MESSAGE });
  assert.equal(MISTAKE_MESSAGE, "The program file has a mistake in it. Ask for it to be fixed, then reopen the app.");
});
