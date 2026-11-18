# K Program v2 — exercise images (draft plan)

- **Date:** 2026-11-18
- **Status:** draft, not started — open questions at the bottom

## Why

v1 describes each exercise in text only (name, sets × reps, a one-line tip). For a first-timer, text alone is hard to follow: she can't tell what a "45° back extension" or "cable kickback" looks like. v2 shows a picture of every exercise, ideally moving, right in the session page.

## Goals

- Every one of the 15 exercises shows a visual: a short loop (start ↔ end position) or at least a still image.
- Works offline like the rest of the app: images are cached by the service worker.
- Stays light: total images well under ~3 MB so the first install on mobile data is quick.
- Adding or swapping an exercise image is a data change (`program.json` + a file in `images/`), not a code change.

## Non-goals

- Video with sound, full tutorials, or YouTube embeds (need signal, heavy, ads).
- Images for the alternatives ("Busy? …") — the main exercise only in v2.
- Changing the program itself.

## Approaches

| Approach | Trade-off | Pick |
|---|---|---|
| **A. Public-domain photo pairs, animated in CSS.** Use the open [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense / public domain): each exercise has 2 photos (start and end position). Show them as a gentle crossfade loop, like a 2-frame GIF. | Free, legal to bundle, offline, tiny code. Coverage and style depend on the dataset: a few of our 15 may be missing or look different from her gym's machines. | **Recommended** |
| B. Animated GIF/WebP files from an exercise library (e.g. an API like ExerciseDB). | Smoothest animation, but licences usually forbid redistribution or need a paid plan; files are large (300 KB–1 MB each). | No |
| C. Custom illustrations (commissioned or generated), one consistent style. | Best look and exact match to each exercise, but costs time/money, and generated anatomy is often wrong — risky for form cues. | Later, if A's coverage is poor |
| D. Link out to a video per exercise. | Zero work in the app, but needs signal at the gym and leaves the app. | Fallback only, as an optional "Watch" link |

## Design (approach A)

- **Data:** each exercise in `program.json` gets an optional `images` field, e.g. `"images": ["images/hip-thrust-0.jpg", "images/hip-thrust-1.jpg"]` (1 = still, 2 = animated loop). Missing `images` → the card looks exactly like v1.
- **Files:** images copied into `images/` in the repo (resized to ~480 px wide, compressed JPEG/WebP, ~30–60 KB each → 15 × 2 × ~50 KB ≈ 1.5 MB).
- **Session page:** the visual sits at the top of each exercise card, full card width, 4:3 frame, rounded corners. Two frames crossfade every ~1.2 s with CSS only (no JS timer). Tapping the image pauses / plays it. Respects iOS "Reduce Motion": shows the end-position still instead of animating.
- **Offline:** `sw.js` caches every image path listed in `program.json` at install (read from the cached program), plus a cache version bump. The existing "every file the page needs is cached" test is extended to image paths.
- **Credits:** a small "Exercise photos: free-exercise-db (public domain)" line at the bottom of Home.

## Tasks (rough)

1. **Match exercises to images:** for each of the 15 exercises, find the closest free-exercise-db entry; list gaps. Output: a mapping table in this doc.
2. **Fill the gaps:** for exercises with no good match, choose per gap: a close variant, a custom illustration (approach C), or text-only for now.
3. **Import and optimise images** into `images/` (resize + compress script, committed so it can be rerun).
4. **Data + validation:** add `images` to `program.json`; extend `isValidProgram` and the program tests (paths exist, 1–2 images each).
5. **Render:** show the visual in `renderSession`; CSS crossfade, pause on tap, reduced-motion still. Tests on the rendered HTML.
6. **Offline:** cache images in `sw.js`, bump `CACHE` to `kprogram-v2`; extend `tests/pwa.test.js` and `tests/sw.test.js`.
7. **Browser check + deploy:** headless check (images load, no layout overflow, works offline), push to `main` → Vercel redeploys; check on her iPhone.

## Open questions

1. **Animated loop or still images?** Recommendation: animated 2-frame loop where available, still otherwise.
2. **Where the visual goes:** big at the top of each exercise card (recommended), or a small thumbnail that opens full screen on tap?
3. **Gaps:** if a few exercises (likely candidates: 45° back extension glute focus, cable glute kickback, hip abduction machine) have no good public-domain photos, is text-only acceptable for those in v2, or should we do custom illustrations?
4. **Also show images for the alternatives** ("Busy? …")? Recommendation: not in v2.
