import { currentWeek, nextSessionId, phaseForWeek, resolveToday } from "./schedule.js";
import { loadLastDone, saveLastDone } from "./storage.js";
import { renderError, renderHome, renderSession } from "./render.js";

const app = document.getElementById("app");

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const today = () => resolveToday(location.search, new Date());

function sessionFromHash(program) {
  const match = /^#session\/(.+)$/.exec(location.hash);
  return match ? program.sessions.find((s) => s.id === decodeURIComponent(match[1])) : undefined;
}

function render(program) {
  const week = currentWeek(program.startDate, today());
  const phase = phaseForWeek(program.phases, week);
  const session = sessionFromHash(program);
  if (session) {
    app.innerHTML = renderSession({ program, session, week, phase });
    return;
  }
  const lastDone = loadLastDone(safeStorage());
  const nextId = nextSessionId(program.sessions.map((s) => s.id), lastDone?.sessionId ?? null);
  app.innerHTML = renderHome({ program, week, phase, nextId, lastDone });
}

async function loadProgram() {
  const response = await fetch("./program.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function start() {
  let program;
  try {
    program = await loadProgram();
  } catch {
    app.innerHTML = renderError("Couldn't load the program. Open the app once with internet.");
    return;
  }

  render(program);

  window.addEventListener("hashchange", () => {
    render(program);
    window.scrollTo(0, 0);
  });

  // An app left open on the home screen may be resumed days later: refresh Home
  // so the week and "Next up" are current. A session page is left alone so her
  // scroll position survives switching to a music app mid-workout.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !sessionFromHash(program)) render(program);
  });

  app.addEventListener("click", (event) => {
    const button = event.target.closest(".done");
    if (!button) return;
    saveLastDone(safeStorage(), { sessionId: button.dataset.session, date: today() });
    location.hash = "";
  });
}

start();
