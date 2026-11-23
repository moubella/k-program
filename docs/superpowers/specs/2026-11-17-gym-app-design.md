# K Program — gym app design

- **Date:** 2026-11-17
- **Status:** approved (2026-11-17)

## Why

A first-time gym-goer (a beginner, never trained before) wants to lose weight and build her lower body (glutes, legs), with a little upper-body strength work and some cardio. She needs a program she can simply follow: open her phone at the gym, see which ~5 exercises to do today, finish in about an hour, and come back 3 times a week. The app is a personal gift, used by one person, mainly on an iPhone.

Success looks like: she opens the app in the gym, gets to today's session in one tap, knows exactly what to do, and keeps going 3 times a week.

## Goals

- A fixed beginner program: 3 sessions (A, B, C), done in order, 3 times a week.
- Each session fits in about 60 minutes: warm-up, 5 exercises, short cardio finisher.
- The app tells her which exercises to do (sets, reps, rest), nothing more.
- The app knows which week of the program she's in and always shows the exact numbers for that week (lighter first 2 weeks, then the full program), so she never has to adjust anything in her head.
- Feels like an app on her iPhone: icon on the home screen, opens full screen, works with no signal in the gym.
- Changing the program means editing one data file, without touching the app code.

## Non-goals

- Logging weights, reps or history; progress charts.
- Accounts, login, sync between devices, multiple users.
- Nutrition or calorie tracking (weight loss mostly comes from food and daily movement; the app does not try to manage that).
- Videos or detailed exercise tutorials.
- Rest timers, reminders, notifications.
- Editing the program from inside the app.
- App Store / TestFlight distribution.

## Anti-goals (what would make this a failure even if it works)

- Overwhelming her: too many exercises, screens, settings or text.
- Exercises that are risky or intimidating for a first-timer (heavy barbell back squats, conventional deadlifts, anything needing a spotter).
- Needing internet at the gym, or a login, to see today's workout.

## Constraints

- Mobile first, iPhone Safari. Must be usable one-handed with sweaty fingers: big tap targets, large readable text.
- All text in English: exercise names, tips, labels, dates.
- No framework, no build step, no dependencies: plain HTML, CSS and JavaScript.
- Must be served over HTTPS (needed for offline support), from a free static host.
- Assumes a standard commercial gym: dumbbells, cable machine, Smith machine, leg press, leg curl, hip abduction machine, lat pulldown, seated row, chest press, 45° back extension bench, treadmill / bike / stairmaster. Every exercise has an alternative in case a machine is missing or taken.

## Approaches

| Approach | Trade-off | Decision |
|---|---|---|
| **A. Small web app saved to the home screen** (one page + a program data file, offline via a service worker) | Lightest thing that still feels like an app; works offline; updating = edit one file and push. Not in the App Store (irrelevant for one user). | **Chosen** |
| B. Native iPhone app (SwiftUI) | Most "real", but needs Xcode, and without the $99/year Apple developer account a self-installed app expires every 7 days. Heavy for a list of exercises. | Rejected |
| C. No app: shared note (Apple Notes / Notion / Google Sheet) | Zero code, but a wall of text to scroll through at the gym, and less of a gift. | Rejected |
| React Native / Flutter | Same App Store friction as B, with more tooling. | Dropped early |

## The training program

### Weekly rhythm

- 3 sessions a week on any non-consecutive days (e.g. Mon / Wed / Fri), always in order A → B → C → A …
- If she misses a day, she just does the next session in the rotation; nothing is "lost".
- On rest days: a 30-minute walk is the best thing she can add for weight loss.

### Shape of every session (~60 min)

| Block | Time | What |
|---|---|---|
| Start: cardio | ~12 min | 10 min brisk incline walk or bike (breathing harder but able to talk), then 10 glute bridges + 10 bodyweight squats. Changed 2026-11-20: weight loss is the main goal, so every session starts and ends with cardio |
| 5 exercises | ~40 min | Sets × reps and rest as listed below |
| Finish: cardio | 10–15 min | Incline treadmill walk (incline 8–12%, 4.5–5.5 km/h), or stairmaster, or bike. 10 min in weeks 1–2, then 15 min (the app shows the right one for the current week) |

Overall the week is lower-body dominant: 10 of the 15 exercises train glutes/legs, 4 train the upper body, 1 trains the core.

The tables below show the full program (week 3 onwards). In weeks 1–2 every exercise is done for 2 sets instead of 3; the app shows "2 ×" automatically during those weeks (see Progression).

### Session A — Glutes & hamstrings

| # | Exercise | Sets × reps | Rest | Tip | Alternative |
|---|---|---|---|---|---|
| 1 | Hip thrust (machine, or Smith machine) | 3 × 10–12 | 90 s | Chin tucked, push through the heels, squeeze the glutes 1 s at the top | Dumbbell glute bridge on the floor |
| 2 | Dumbbell Romanian deadlift | 3 × 10–12 | 90 s | Soft knees, push the hips back, dumbbells slide down the thighs, back flat | Cable pull-through |
| 3 | Seated leg curl (machine) | 3 × 12 | 60 s | Control the weight on the way back (2–3 s) | Lying leg curl machine |
| 4 | Cable glute kickback | 3 × 12 per leg | 45 s | Hips square, kick back and slightly out, don't arch the lower back | Donkey kicks on the floor |
| 5 | Hip abduction machine | 3 × 15 | 45 s | Lean slightly forward to feel it in the glutes | Side-lying leg raises |

### Session B — Legs & back

| # | Exercise | Sets × reps | Rest | Tip | Alternative |
|---|---|---|---|---|---|
| 1 | Goblet squat | 3 × 10–12 | 90 s | Dumbbell held at the chest, sit down between the heels, knees follow the toes | Bodyweight squat to a bench |
| 2 | Leg press, feet high and wide | 3 × 12 | 90 s | Feet high and wide works the glutes more; never lock the knees; lower back stays on the pad | Dumbbell step-up onto a bench |
| 3 | Lat pulldown | 3 × 10–12 | 60 s | Pull the bar to the upper chest, elbows down toward the hips, chest up | Assisted pull-up machine |
| 4 | Seated cable row | 3 × 10–12 | 60 s | Sit tall, pull the handle to the belly, squeeze the shoulder blades together | Seated row machine |
| 5 | Plank | 3 × 20–30 s | 45 s | Elbows under the shoulders, squeeze the glutes, don't let the hips sag | Plank on the knees |

### Session C — Glutes & full body

| # | Exercise | Sets × reps | Rest | Tip | Alternative |
|---|---|---|---|---|---|
| 1 | Hip thrust (machine, or Smith machine) | 3 × 10–12 | 90 s | Chin tucked, push through the heels, squeeze the glutes 1 s at the top | Dumbbell glute bridge on the floor |
| 2 | Dumbbell reverse lunge | 3 × 10 per leg | 90 s | Step back, front knee over the middle of the foot, push through the front heel to stand | Static split squat, holding something for balance |
| 3 | 45° back extension, glute focus | 3 × 12 | 60 s | Feet turned out, upper back slightly rounded, lift with the glutes, stop at a straight line | Cable pull-through |
| 4 | Chest press machine | 3 × 10–12 | 60 s | Handles at mid-chest height, push without locking the elbows | Incline push-ups on a bench |
| 5 | Seated dumbbell shoulder press | 3 × 10–12 | 60 s | Back against the pad, press up without arching | Shoulder press machine |

On hold since 2026-11-23: exercises 3–5 are out of the app for now, so session C shows only hip thrust and reverse lunge. Their rows stay here, and their photos stay in `images/`, so they can come back later.

Hip thrust appears in A and C on purpose: it is the best glute exercise, and doing it twice a week helps a beginner learn it and progress on it.

### Progression

- **Weeks 1–2 ("learning weeks"):** 2 sets of each exercise instead of 3, light weights, focus on learning the movements. Cardio finisher 10 min.
- **From week 3:** 3 sets as written, cardio finisher 15 min.
- The app switches between these by itself, counting weeks from her start date (see The app → Week counting).
- **Picking a weight:** the last 2 reps of each set should feel hard, but with clean form.
- **Going up:** when she reaches the top of the rep range on every set with good form, she uses the next weight up the following session.
- **After 8–12 weeks:** the program gets refreshed by editing the data file (new exercises or more volume).

### Safety notes (a short block at the bottom of Home)

- Sharp or joint pain means stop that exercise; muscle soreness 1–2 days after a session is normal in the first weeks.
- For the first session, ask gym staff to show how to set up the machines (most gyms offer a free intro).
- If she has an injury or a health condition, check with a doctor before starting.

## The app

### What she sees

Two screens.

**Home** — the current week, the three sessions with the next one highlighted, and a few short notes:

```
┌───────────────────────────────┐
│ K Program                     │
│ Week 2 · learning weeks       │
│ Light weights, focus on form  │
│                               │
│ ┌───────────────────────────┐ │
│ │ A · Glutes & hamstrings   │ │
│ │ last done Mon 30 Nov      │ │
│ └───────────────────────────┘ │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ NEXT UP                   ┃ │
│ ┃ B · Legs & back           ┃ │
│ ┃ 5 exercises · ~60 min     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ ┌───────────────────────────┐ │
│ │ C · Glutes & full body    │ │
│ └───────────────────────────┘ │
│                               │
│ 3 sessions a week, in order   │
│ Rest days: 30 min walk        │
│                               │
│ SAFETY                        │
│ Sharp or joint pain: stop     │
│ Soreness for 1–2 days: normal │
│ Ask staff to show the machines│
└───────────────────────────────┘
```

**Session** — everything for that session on one scrolling page, with the numbers for the current week (here week 2, so 2 sets and 10 min of cardio):

```
┌───────────────────────────────┐
│ ‹ Back                        │
│ A · Glutes & hamstrings       │
│ Week 2                        │
│                               │
│ WARM-UP · 10 min              │
│ 5 min bike, then 2 rounds of  │
│ 10 glute bridges + 10 squats  │
│                               │
│ 1  Hip thrust                 │
│    2 × 10–12 · rest 90 s      │
│    Squeeze glutes at the top  │
│    Busy? Dumbbell glute bridge│
│                               │
│ 2  Dumbbell Romanian deadlift │
│    2 × 10–12 · rest 90 s      │
│    …                          │
│                               │
│ CARDIO · 10 min               │
│ Incline walk 8–12%, 5 km/h    │
│                               │
│ ┌───────────────────────────┐ │
│ │       I'm done ✓          │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

### Behaviour

- Opening the app shows Home. The session after the last finished one is marked "Next up"; on first use that is A.
- Tapping a session opens its page. "‹ Back" returns to Home.
- "I'm done" records which session she finished and the date, then returns to Home with the next session highlighted.
- That record (last session id + date) is the only thing the app stores, in the phone's local storage. If storage is unavailable or cleared, the app still works; it just highlights A.
- The home-screen notes (rest days, safety) come from the program file.
- Supports light and dark mode (follows the phone setting).

### Week counting

- The program file holds her **start date** (the day of her first session) and a short list of **phases**. Each phase starts at a given week and sets the number of sets per exercise, the cardio duration, and an optional one-line message:
  - Phase 1, from week 1: 2 sets, 10 min cardio, message "Learning weeks: light weights, focus on form".
  - Phase 2, from week 3: 3 sets, 15 min cardio, no message.
- Current week = number of full 7-day blocks since the start date, plus 1, using the phone's local date. A start date in the future shows week 1.
- Home shows "Week N" plus the current phase's message (if any). The session page shows "Week N" and the sets and cardio minutes for the current phase. Reps, rest, tips and alternatives come from each exercise and do not change with the phase.
- The week is computed from the date every time the app opens; nothing extra is stored on the phone, so the only stored state is still the last finished session.
- Refreshing the program later (after 8–12 weeks) can mean adding a phase or editing exercises in the same file.

### Files

```
index.html             page, styles and script (split into style.css / app.js if cleaner)
program.json           the whole program — the only file to edit to change workouts
manifest.webmanifest   app name, icon, full-screen display
sw.js                  service worker: caches everything for offline use
icons/                 apple-touch-icon (180×180) and a 512×512 icon
```

Shape of `program.json` (illustrative; exact fields are the builder's call):

```json
{
  "title": "K Program",
  "startDate": "2026-11-23",
  "phases": [
    { "fromWeek": 1, "sets": 2, "cardioMinutes": 10, "message": "Learning weeks: light weights, focus on form" },
    { "fromWeek": 3, "sets": 3, "cardioMinutes": 15 }
  ],
  "notes": ["3 sessions a week, in order", "Rest days: 30 min walk"],
  "safety": ["Sharp or joint pain: stop that exercise", "..."],
  "warmup": "5 min bike or treadmill, then 2 rounds of 10 glute bridges + 10 bodyweight squats",
  "cardio": "Incline treadmill walk 8–12%, 4.5–5.5 km/h (or stairmaster / bike)",
  "sessions": [
    {
      "id": "A",
      "name": "Glutes & hamstrings",
      "exercises": [
        {
          "name": "Hip thrust (machine, or Smith machine)",
          "reps": "10–12",
          "rest": "90 s",
          "tip": "Chin tucked, push through the heels, squeeze the glutes 1 s at the top",
          "alt": "Dumbbell glute bridge on the floor"
        }
      ]
    }
  ]
}
```

### Install, offline and updates

- She opens the link once in Safari, taps Share → Add to Home Screen. From then on it opens from its own icon, full screen.
- The service worker caches all files so the app works with no signal.
- When the program file changes and is deployed, she gets the new version the next time she opens the app with signal. The builder picks the caching strategy that achieves this (e.g. network-first for `program.json` with cache fallback, versioned cache for the rest).

### Hosting

Any free static host with HTTPS. GitHub Pages is simplest if the repo can be public; Netlify or Cloudflare Pages if it should stay private. Choosing and setting up the host happens at deploy time.

## Decided vs. left to the builder

**Decided:**

- Web app saved to the home screen, plain HTML/CSS/JS, no build, no dependencies.
- 3 sessions A/B/C in rotation, ~60 min each, contents as in the tables above.
- Two screens (Home, Session); only stored state is the last finished session.
- Program lives in one data file separate from the code.
- Works offline.
- English throughout.
- The app counts the weeks from a start date in the program file and shows the right sets and cardio minutes for the current phase (2 sets / 10 min in weeks 1–2, then 3 sets / 15 min).

**Calls made during review (easy to change):**

- Start date lives in the program file, not saved on the phone, so the app stores nothing extra; the start date gets set to her first gym day before deploying.
- The safety notes are a small always-visible block at the bottom of Home.
- Phases set one sets count for every exercise; per-exercise overrides are not needed for this program.

**Left to the builder:**

- Exact `program.json` fields and whether it is JSON or a JS data file.
- Visual styling (colours, fonts) within "simple, light, friendly, big and readable".
- Service-worker caching strategy, as long as offline works and program updates arrive.
- One file vs. separate CSS/JS files.
- Icon design.
- How to check the app before handing it over (at minimum: install on an iPhone, test in airplane mode, run through "I'm done" for A → B → C → A, and check week 1, week 2 → week 3 switch, and a future start date — e.g. via a way to fake today's date while testing).
