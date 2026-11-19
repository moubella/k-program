# Exercise image prompts (female, AI-generated)

These prompts replace the free-exercise-db photos (all male) with illustrations of a woman. You generate 27 images: 2 per exercise (start and end position), and 1 for the plank.

## How to generate

1. **Use one chat / one session for everything**, so the woman, outfit and style stay the same. Generate image 1, then for every next prompt attach it (or say "same woman, same outfit, same style as before").
2. **Generate each pair back to back** and ask for the same camera angle and the same equipment position, so only her body moves. The app fades between the two images, and a camera jump looks bad.
3. **Landscape 3:2** (e.g. 1536 × 1024). The app crops to 3:2.
4. **Check form** with the line under each exercise before keeping an image. Regenerate if it's wrong: AI often rounds backs, bends wrists or adds extra fingers.
5. **Save with the exact file names** below into a folder called `images-new/` at the repo root, then tell Claude. Claude shrinks them, swaps them in, updates the credit line and the offline cache.

## Style block (paste at the start of every prompt)

> Clean, modern flat illustration with soft shading, fitness app style. A woman in her late 20s with an athletic but beginner-friendly build, dark hair in a ponytail, wearing a pink sports top (#c93f6d), black leggings and white sneakers. Plain light grey background, only the gym equipment needed, no other people, no text, no logos. Landscape 3:2.

## Prompts

### 1. Hip thrust — `hip-thrust-0.jpg`, `hip-thrust-1.jpg`
- **0 (start):** Side view. Her upper back rests on the edge of a flat bench, feet flat on the floor, knees bent, hips low near the floor, a padded barbell across her hips held with both hands.
- **1 (end):** Same angle. Hips pushed up until her torso and thighs form a straight line parallel to the floor, shins vertical, knees at 90°, chin tucked.
- **Form check:** at the top, no arch in the lower back; shins vertical.

### 2. Dumbbell Romanian deadlift — `romanian-deadlift-0.jpg`, `romanian-deadlift-1.jpg`
- **0:** Side view. Standing tall, a dumbbell in each hand in front of her thighs, knees soft.
- **1:** Same angle. Hips pushed back, back flat, torso tilted forward about 45°, dumbbells at mid-shin close to her legs, knees slightly bent.
- **Form check:** back flat, never rounded; dumbbells stay close to the legs.

### 3. Seated leg curl (machine) — `seated-leg-curl-0.jpg`, `seated-leg-curl-1.jpg`
- **0:** Side view. Seated on a leg curl machine, legs straight out in front, the roller pad behind her lower legs just above the heels, thigh pad on top of her thighs.
- **1:** Same angle. Knees bent about 90°, heels pulled down and back under the seat.
- **Form check:** back against the seat, thighs stay down.

### 4. Cable glute kickback — `cable-kickback-0.jpg`, `cable-kickback-1.jpg`
- **0:** Side view. Standing facing a cable machine, hands holding the frame, slight forward lean, an ankle strap on her right ankle attached to the low cable, right leg straight under her hip.
- **1:** Same angle. Right leg kicked straight back and slightly out, knee straight, hips square.
- **Form check:** no arch in the lower back; the standing leg stays slightly bent.

### 5. Hip abduction machine — `hip-abduction-0.jpg`, `hip-abduction-1.jpg`
- **0:** Front view. Seated on a hip abduction machine, pads on the outside of her knees, knees together, leaning slightly forward, hands on the handles.
- **1:** Same angle. Knees pushed wide apart against the pads.
- **Form check:** slight forward lean, back not slumped.

### 6. Goblet squat — `goblet-squat-0.jpg`, `goblet-squat-1.jpg`
- **0:** Front three-quarter view. Standing, feet shoulder-width apart, holding one dumbbell vertically against her chest with both hands.
- **1:** Same angle. Squatting down until thighs are parallel to the floor, chest up, knees pointing the same way as the toes, heels on the floor.
- **Form check:** heels down, knees not caving in, back straight.

### 7. Leg press, feet high and wide — `leg-press-0.jpg`, `leg-press-1.jpg`
- **0:** Side view. Seated in a 45° leg press machine, back and hips against the pad, feet high and wide on the platform, legs extended with knees slightly bent (not locked).
- **1:** Same angle. Knees bent about 90°, platform lowered toward her chest.
- **Form check:** lower back stays on the pad; knees never locked.

### 8. Lat pulldown — `lat-pulldown-0.jpg`, `lat-pulldown-1.jpg`
- **0:** Front three-quarter view. Seated at a lat pulldown machine, thighs under the pads, hands on the wide bar overhead, arms straight.
- **1:** Same angle. Bar pulled down to her upper chest, elbows pointing down, chest up.
- **Form check:** bar in front of the head (never behind the neck), torso only slightly leaning back.

### 9. Seated cable row — `seated-cable-row-0.jpg`, `seated-cable-row-1.jpg`
- **0:** Side view. Seated on a cable row bench, feet on the platform, knees slightly bent, torso upright, arms straight holding a V-handle.
- **1:** Same angle. Handle pulled to her belly, elbows back past the torso, shoulder blades squeezed, torso still upright.
- **Form check:** torso upright, not swinging back.

### 10. Plank — `plank-0.jpg` (one image)
- Side view. Forearm plank on a mat, elbows under the shoulders, body in a straight line from head to heels, glutes squeezed.
- **Form check:** hips neither sagging nor raised.

### 11. Dumbbell reverse lunge — `reverse-lunge-0.jpg`, `reverse-lunge-1.jpg`
- **0:** Side view. Standing tall, a dumbbell in each hand at her sides.
- **1:** Same angle. Right leg stepped back, back knee just above the floor, front knee at 90° over the middle of the front foot, torso upright.
- **Form check:** front knee not past the toes, torso upright.

### 12. 45° back extension, glute focus — `back-extension-0.jpg`, `back-extension-1.jpg`
- **0:** Side view. On a 45° back extension bench, hips on the pad, feet anchored and turned slightly out, arms crossed over her chest, bent forward at the hips with upper back slightly rounded.
- **1:** Same angle. Lifted until her body is a straight line from head to heels, not past it.
- **Form check:** stops at a straight line, no overarching at the top.

### 13. Chest press machine — `chest-press-0.jpg`, `chest-press-1.jpg`
- **0:** Side view. Seated on a chest press machine, back against the pad, handles at mid-chest height, elbows bent behind.
- **1:** Same angle. Arms pushed forward nearly straight, elbows not locked.
- **Form check:** back on the pad, wrists straight.

### 14. Seated dumbbell shoulder press — `shoulder-press-0.jpg`, `shoulder-press-1.jpg`
- **0:** Front three-quarter view. Seated on an upright bench, back against the pad, dumbbells at shoulder height, palms facing forward.
- **1:** Same angle. Dumbbells pressed overhead, arms nearly straight.
- **Form check:** no arch in the lower back, wrists straight.
