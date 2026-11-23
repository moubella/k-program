# Week 0: cardio only — design

Short design (small change). Decided with the owner on 2026-11-23; calls marked *(our call)* were left to the builder ("choose the best").

## Intent

Before the strength sessions start, she does one week of cardio only, on the treadmill and the exercise bike, to get used to going to the gym. The existing A/B/C program stays exactly as it is, just one week later.

## What she sees

- **Dates:** `startDate` (2026-11-29) is the first day of week 0. Week 0 runs 29 Nov – 5 Dec, week 1 (A/B/C) starts 6 Dec, phase 2 (3 sets) starts 20 Dec. Before the start date the app shows week 0.
- **First page during week 0:** the Week 0 home instead of the A/B/C cards: title, "Week 0", the week 0 message, one "Next up" card for the cardio session, then the usual notes, safety list and credits.
- **Week 0 session page** (`#week0`): treadmill then bike, each as a card with its optional illustration, minutes and settings, a form tip and a "Busy?" fallback, then "I'm done ✓".
- **Week 1 preview:** under the cardio card, a "Week 1 · starts <date>" heading lists the A/B/C cards; opening one shows it as week 1 (2 sets).
- **From week 1:** Home is the A/B/C page as before; week 0 is no longer shown. "I'm done" in week 0 saves session id `W0`, so the first A/B/C "Next up" is A.

## Content *(our call)*

- Same session 3 times in the week: 15 min treadmill incline walk + 15 min exercise bike, easy pace (she can still talk).
- Treadmill: incline 5–8 %, 4.5–5 km/h (easier than the 8–12 % used at the end of A/B/C sessions).
- Bike: easy resistance, 70–90 rpm, seat at hip height.

## Approaches

- **A. A `week0` block in `program.json` with its own home and session page** — picked. Minutes, settings and illustrations are edited in the program file like everything else, and A/B/C code and tests stay untouched.
- **B. Week 0 as a hidden session "D" in the A/B/C list** — rejected: the session page wraps every session in warm-up/finish cardio and shows "sets × reps", which is wrong for a cardio-only day, and it would mix a one-off week into the A/B/C rotation.

## Decisions

- Week numbers count from 0 at `startDate` (`currentWeek`); `phases` keep `fromWeek: 1` and `3`.
- `program.json` gets a required `week0`: `name`, `message`, `machines` (non-empty), each machine with `name`, `minutes` (number), `settings`, `tip`, `alt`, optional `images` (1 still or 2-frame loop, same rules as exercises). The loader rejects a malformed `week0`.
- Week 0 machine images are cached offline like exercise images; illustrations come later and only need `images` added plus the files.

## Non-goals

- No counting of week 0 sessions (1/3, 2/3…): "last done" is enough.
- No change to A/B/C content, phases or the session page.
