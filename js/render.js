import { addDays, formatShortDate } from "./schedule.js";

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

const list = (items, className) =>
  `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

function sessionCard(program, session, { nextId, lastDone }) {
  const isNext = session.id === nextId;
  const href = `#session/${escapeHtml(session.id)}`;
  const label = isNext ? `<span class="card-label">Next up</span>` : "";
  const title = `<span class="card-title">${escapeHtml(session.id)} · ${escapeHtml(session.name)}</span>`;
  let meta = "";
  if (isNext) {
    meta = `${session.exercises.length} exercises · ~${program.sessionMinutes} min`;
  } else if (lastDone && lastDone.sessionId === session.id) {
    meta = `last done ${formatShortDate(lastDone.date)}`;
  }
  const metaHtml = meta ? `<span class="card-meta">${escapeHtml(meta)}</span>` : "";
  return `<a class="${isNext ? "card next" : "card"}" href="${href}">${label}${title}${metaHtml}</a>`;
}

function homePage(program, week, message, cards, extra = "") {
  const messageHtml = message ? `<p class="phase">${escapeHtml(message)}</p>` : "";
  return `
    <header class="top">
      <h1>${escapeHtml(program.title)}</h1>
      <p class="week">Week ${week}</p>
      ${messageHtml}
    </header>
    <nav class="sessions">${cards}</nav>
    ${extra}
    ${list(program.notes, "notes")}
    <section class="safety">
      <h2>Safety</h2>
      ${list(program.safety, "safety-list")}
    </section>
    <p class="credits">Exercise images: AI-generated illustrations and free-exercise-db photos (public domain)</p>`;
}

export function renderHome({ program, week, phase, nextId, lastDone }) {
  const cards = program.sessions.map((s) => sessionCard(program, s, { nextId, lastDone })).join("");
  return homePage(program, week, phase.message, cards);
}

// Week 0 is cardio only: one session, saved as "W0" when done, so week 1 starts at A.
export const WEEK0_ID = "W0";

const week0Title = (week0) => `Week 0 · ${escapeHtml(week0.name)}`;

export function renderWeek0Home({ program, lastDone }) {
  const { week0 } = program;
  const minutes = week0.machines.reduce((total, m) => total + m.minutes, 0);
  let meta = `${week0.machines.length} machines · ~${minutes} min`;
  if (lastDone && lastDone.sessionId === WEEK0_ID) meta += ` · last done ${formatShortDate(lastDone.date)}`;
  const card = `<a class="card next" href="#week0"><span class="card-label">Next up</span><span class="card-title">${week0Title(week0)}</span><span class="card-meta">${escapeHtml(meta)}</span></a>`;
  // She can already look at the strength sessions that start the week after.
  const week1Cards = program.sessions.map((s) => sessionCard(program, s, { nextId: null, lastDone: null })).join("");
  const week1 = `
    <h2 class="sessions-heading">Week 1 · starts ${formatShortDate(addDays(program.startDate, 7))}</h2>
    <nav class="sessions">${week1Cards}</nav>`;
  return homePage(program, 0, week0.message, card, week1);
}

// Two images = start/end positions shown as a loop (CSS); one image = a still.
function exerciseVisual(exercise) {
  const images = exercise.images ?? [];
  if (images.length === 0) return "";
  const [first, second] = images;
  const main = `<img src="${escapeHtml(first)}" alt="${escapeHtml(exercise.name)}">`;
  if (!second) return `<div class="visual">${main}</div>`;
  return `<div class="visual animated">${main}<img src="${escapeHtml(second)}" alt="" aria-hidden="true"></div>`;
}

function exerciseItem(exercise, sets) {
  return `
    <li class="exercise">
      ${exerciseVisual(exercise)}
      <h3>${escapeHtml(exercise.name)}</h3>
      <p class="dose">${sets} × ${escapeHtml(exercise.reps)} · rest ${escapeHtml(exercise.rest)}</p>
      <p class="tip">${escapeHtml(exercise.tip)}</p>
      <p class="alt">Busy? ${escapeHtml(exercise.alt)}</p>
    </li>`;
}

export function renderSession({ program, session, week, phase }) {
  const exercises = session.exercises.map((e) => exerciseItem(e, phase.sets)).join("");
  return `
    <header class="top">
      <a class="back" href="#">‹ Back</a>
      <h1>${escapeHtml(session.id)} · ${escapeHtml(session.name)}</h1>
      <p class="week">Week ${week}</p>
    </header>
    <section class="block">
      <h2>Start · Cardio · ${program.warmupMinutes} min</h2>
      <p>${escapeHtml(program.warmup)}</p>
    </section>
    <ol class="exercises">${exercises}</ol>
    <section class="block">
      <h2>Finish · Cardio · ${phase.cardioMinutes} min</h2>
      <p>${escapeHtml(program.cardio)}</p>
    </section>
    <button class="done" data-session="${escapeHtml(session.id)}">I'm done ✓</button>`;
}

function machineItem(machine) {
  return `
    <li class="exercise">
      ${exerciseVisual(machine)}
      <h3>${escapeHtml(machine.name)}</h3>
      <p class="dose">${machine.minutes} min · ${escapeHtml(machine.settings)}</p>
      <p class="tip">${escapeHtml(machine.tip)}</p>
      <p class="alt">Busy? ${escapeHtml(machine.alt)}</p>
    </li>`;
}

export function renderWeek0({ program }) {
  const { week0 } = program;
  return `
    <header class="top">
      <a class="back" href="#">‹ Back</a>
      <h1>${week0Title(week0)}</h1>
      <p class="week">${escapeHtml(week0.message)}</p>
    </header>
    <ol class="exercises">${week0.machines.map(machineItem).join("")}</ol>
    <button class="done" data-session="${WEEK0_ID}">I'm done ✓</button>`;
}

export function renderError(message) {
  return `<p class="error">${escapeHtml(message)}</p>`;
}
