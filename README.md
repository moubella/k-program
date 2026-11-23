# K Program

A tiny gym app for a beginner: 3 sessions a week (A → B → C), about an hour each, lower-body focused. It opens from the iPhone home screen, works with no signal in the gym, and always shows exactly what to do today, with lighter numbers in the first two weeks.

- Design: [`docs/superpowers/specs/2026-11-17-gym-app-design.md`](docs/superpowers/specs/2026-11-17-gym-app-design.md)
- Build plan: [`docs/superpowers/plans/2026-11-17-gym-app.md`](docs/superpowers/plans/2026-11-17-gym-app.md)

Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies.

## Files

| File | What it is |
|---|---|
| `program.json` | The whole program. The only file to edit to change workouts. |
| `index.html`, `style.css` | The page and its look (light and dark mode). |
| `js/app.js` | Wires everything to the page: routing, the "I'm done" button. |
| `js/schedule.js` | Week counting, phases, A → B → C rotation, dates. |
| `js/storage.js` | Remembers the last finished session on the phone. |
| `js/render.js` | Builds the Home and Session screens. |
| `sw.js` | Service worker: offline support. |
| `manifest.webmanifest`, `icons/` | Home-screen name, icon and favicon. `icons/icon.svg` is the source; `scripts/render-icons.sh` renders the PNG sizes and the root `favicon.ico` from it (needs Firefox). |
| `images/`, `scripts/import-images.sh` | Exercise photos (free-exercise-db, public domain) and the script that downloads and shrinks them. |

## Run the tests

Needs Node 22 or newer.

```bash
npm test
```

## Preview locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/ and use the browser's phone-size view.

To see the app as it will look on a given day, add `?today=YYYY-MM-DD`, e.g. http://localhost:8000/?today=2026-12-07 shows week 3 (3 sets, 15 min cardio). This also works on the deployed app.

## Edit the program

Everything is in `program.json`:

- `startDate`: the day of her first session (`YYYY-MM-DD`). Week 1 starts that day; the app counts weeks from it. Set it before deploying.
- `phases`: what changes with the weeks. Each phase starts at `fromWeek` and sets the number of `sets` for every exercise, the `cardioMinutes`, and an optional `message` shown on Home. Today: weeks 1–2 are 2 sets / 10 min ("Learning weeks"), week 3 onwards is 3 sets / 15 min. To progress later, add a phase, e.g. `{ "fromWeek": 9, "sets": 4, "cardioMinutes": 20 }`.
- `sessions`: the three sessions, each with five `exercises`. Each exercise has `name`, `reps` (without the sets, e.g. `"10–12"`, `"12 per leg"`, `"20–30 s"`), `rest`, `tip` (one-line form cue) and `alt` (what to do if the machine is busy).
- `images` (optional, per exercise): 1 path = a still photo, 2 paths = start/end positions shown as a loop. To change photos, edit the mapping in `scripts/import-images.sh`, rerun it, and list the new files in `sw.js` `ASSETS` (the tests check this).
- `warmup` / `warmupMinutes`, `cardio`, `notes` (Home), `safety` (Home), `sessionMinutes`, `title`.

`npm test` checks the program still matches the design; if you change exercises on purpose, update `tests/program.test.js` too.

## Ship a change

- **Only `program.json` changed:** commit and deploy. She gets it the next time she opens the app with signal.
- **Any other file changed** (code, styles, icons): also bump `CACHE` in `sw.js` (`kprogram-v1` → `kprogram-v2`), otherwise phones keep the old cached files.

## Install on her iPhone

1. Open the deployed link in **Safari**.
2. Tap **Share** → **Add to Home Screen** → **Add**.
3. Open it once from the new icon while online, so it is saved for offline use.

From then on it opens full screen from its icon and works in airplane mode.

## Hosting (Vercel)

The app is hosted on Vercel's free Hobby plan; the GitHub repo can stay private.

1. On vercel.com: **Add New → Project → Import** the `k-program` GitHub repo.
2. Framework preset: **Other**. Leave the build command empty. Output directory: the repository root.
3. Deploy. Every push to `main` redeploys automatically.

`.vercelignore` keeps `docs/`, `tests/`, `README.md` and `package.json` off the public site, so only the app files are published.
