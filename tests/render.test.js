import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { escapeHtml, renderError, renderHome, renderSession } from "../js/render.js";

const program = JSON.parse(fs.readFileSync(new URL("../program.json", import.meta.url), "utf8"));
const [p1, p2] = program.phases;

test("escapeHtml escapes the five HTML characters", () => {
  assert.equal(escapeHtml(`<b>"Tom" & 'Jerry'</b>`), "&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jerry&#39;&lt;/b&gt;");
});

test("home highlights the next session and shows the last one done", () => {
  const html = renderHome({ program, week: 2, phase: p1, nextId: "B", lastDone: { sessionId: "A", date: "2026-11-30" } });
  assert.match(html, /<a class="card next" href="#session\/B">/);
  assert.match(html, /<a class="card" href="#session\/A">/);
  assert.match(html, /<a class="card" href="#session\/C">/);
  assert.ok(html.includes("Next up"));
  assert.ok(html.includes("B · Legs &amp; back"));
  assert.ok(html.includes("5 exercises · ~60 min"));
  assert.ok(html.includes("last done Mon 30 Nov"));
  assert.ok(html.includes("Week 2"));
  assert.ok(html.includes("Learning weeks: light weights, focus on form"));
  assert.ok(html.includes("Rest days: 30 min walk"));
  assert.ok(html.includes("Sharp or joint pain: stop that exercise"));
});

test("home in week 3 has no phase message and nothing marked done on first use", () => {
  const html = renderHome({ program, week: 3, phase: p2, nextId: "A", lastDone: null });
  assert.ok(html.includes("Week 3"));
  assert.ok(!html.includes("Learning weeks"));
  assert.ok(!html.includes("last done"));
  assert.match(html, /<a class="card next" href="#session\/A">/);
});

test("session in week 2 shows 2 sets and 10 min of cardio", () => {
  const html = renderSession({ program, session: program.sessions[0], week: 2, phase: p1 });
  assert.ok(html.includes("A · Glutes &amp; hamstrings"));
  assert.ok(html.includes("Week 2"));
  assert.ok(html.includes("Warm-up · 10 min"));
  assert.ok(html.includes("2 × 10–12 · rest 90 s"));
  assert.ok(html.includes("Chin tucked, push through the heels, squeeze the glutes 1 s at the top"));
  assert.ok(html.includes("Busy? Dumbbell glute bridge on the floor"));
  assert.ok(html.includes("Cardio · 10 min"));
  assert.ok(html.includes("Incline treadmill walk (incline 8–12%, 4.5–5.5 km/h), or stairmaster, or bike"));
  assert.ok(html.includes('<button class="done" data-session="A">I\'m done ✓</button>'));
  assert.ok(html.includes('<a class="back" href="#">‹ Back</a>'));
});

test("session in week 3 shows 3 sets and 15 min of cardio", () => {
  const html = renderSession({ program, session: program.sessions[1], week: 3, phase: p2 });
  assert.ok(html.includes("3 × 20–30 s · rest 45 s"));
  assert.ok(html.includes("Cardio · 15 min"));
  assert.ok(!html.includes("2 × "));
});

test("session lists all five exercises in order", () => {
  const html = renderSession({ program, session: program.sessions[2], week: 3, phase: p2 });
  const positions = program.sessions[2].exercises.map((e) => html.indexOf(escapeHtml(e.name)));
  assert.ok(positions.every((pos) => pos > -1), "every exercise name is shown");
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("renderError escapes its message", () => {
  assert.ok(renderError("a < b").includes("a &lt; b"));
});

test("an exercise with two images shows an animated visual at the top of its card", () => {
  const html = renderSession({ program, session: program.sessions[0], week: 3, phase: p2 });
  assert.ok(
    html.includes(
      '<div class="visual animated"><img src="images/hip-thrust-0.jpg" alt="Hip thrust (machine, or Smith machine)"><img src="images/hip-thrust-1.jpg" alt="" aria-hidden="true"></div>',
    ),
  );
  const card = html.slice(html.indexOf('<li class="exercise">'), html.indexOf("</li>"));
  assert.ok(card.indexOf('class="visual') < card.indexOf("<h3>"), "visual comes before the exercise name");
});

test("an exercise with one image shows a still visual", () => {
  const html = renderSession({ program, session: program.sessions[1], week: 3, phase: p2 });
  assert.ok(html.includes('<div class="visual"><img src="images/plank-0.jpg" alt="Plank"></div>'));
});

test("an exercise without images has no visual", () => {
  const session = structuredClone(program.sessions[1]);
  for (const exercise of session.exercises) delete exercise.images;
  const html = renderSession({ program, session, week: 3, phase: p2 });
  assert.ok(!html.includes('class="visual'));
});

test("image paths and names are escaped", () => {
  const session = structuredClone(program.sessions[1]);
  session.exercises[4].images = ['images/a"b.jpg'];
  session.exercises[4].name = "Plank <hold>";
  const html = renderSession({ program, session, week: 3, phase: p2 });
  assert.ok(html.includes('<img src="images/a&quot;b.jpg" alt="Plank &lt;hold&gt;">'));
});

test("home credits the exercise photos", () => {
  const html = renderHome({ program, week: 1, phase: p1, nextId: "A", lastDone: null });
  assert.ok(html.includes('<p class="credits">Exercise photos: free-exercise-db (public domain)</p>'));
});
