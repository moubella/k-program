import { formatShortDate } from "./schedule.js";

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

export function renderHome({ program, week, phase, nextId, lastDone }) {
  const message = phase.message ? `<p class="phase">${escapeHtml(phase.message)}</p>` : "";
  const cards = program.sessions.map((s) => sessionCard(program, s, { nextId, lastDone })).join("");
  return `
    <header class="top">
      <h1>${escapeHtml(program.title)}</h1>
      <p class="week">Week ${week}</p>
      ${message}
    </header>
    <nav class="sessions">${cards}</nav>
    ${list(program.notes, "notes")}
    <section class="safety">
      <h2>Safety</h2>
      ${list(program.safety, "safety-list")}
    </section>`;
}

function exerciseItem(exercise, sets) {
  return `
    <li class="exercise">
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
      <h2>Warm-up · ${program.warmupMinutes} min</h2>
      <p>${escapeHtml(program.warmup)}</p>
    </section>
    <ol class="exercises">${exercises}</ol>
    <section class="block">
      <h2>Cardio · ${phase.cardioMinutes} min</h2>
      <p>${escapeHtml(program.cardio)}</p>
    </section>
    <button class="done" data-session="${escapeHtml(session.id)}">I'm done ✓</button>`;
}

export function renderError(message) {
  return `<p class="error">${escapeHtml(message)}</p>`;
}
