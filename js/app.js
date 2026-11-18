import { currentWeek, nextSessionId, phaseForWeek, resolveToday } from "./schedule.js";
import { loadLastDone, saveLastDone } from "./storage.js";
import { renderError, renderHome, renderSession } from "./render.js";
import { loadProgram, MISTAKE_MESSAGE } from "./program.js";

const app = document.getElementById("app");

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const today = () => resolveToday(location.search, new Date());
const fetchProgram = () => loadProgram(() => fetch("./program.json"));

function sessionFromHash(program) {
  const match = /^#session\/(.+)$/.exec(location.hash);
  return match ? program.sessions.find((s) => s.id === decodeURIComponent(match[1])) : undefined;
}

function render(program) {
  try {
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
  } catch {
    app.innerHTML = renderError(MISTAKE_MESSAGE);
  }
}

async function start() {
  let program;
  try {
    program = await fetchProgram();
  } catch (error) {
    app.innerHTML = renderError(error.message);
    return;
  }

  render(program);

  window.addEventListener("hashchange", () => {
    render(program);
    window.scrollTo(0, 0);
  });

  // iOS can keep the home-screen app suspended for days. When she comes back to
  // Home, reload the program (so edits arrive without swiping the app away) and
  // refresh the week and "Next up". If loading fails, keep the program we have.
  // A session page is left alone so her scroll position survives switching to a
  // music app mid-workout.
  document.addEventListener("visibilitychange", async () => {
    if (document.hidden || sessionFromHash(program)) return;
    try {
      program = await fetchProgram();
    } catch {
      // Offline or a broken edit: the program already in memory is still good.
    }
    if (!sessionFromHash(program)) render(program);
  });

  app.addEventListener("click", (event) => {
    const button = event.target.closest(".done");
    if (!button) return;
    saveLastDone(safeStorage(), { sessionId: button.dataset.session, date: today() });
    location.hash = "";
  });
}

start();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
