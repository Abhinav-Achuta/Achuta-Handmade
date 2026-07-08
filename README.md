# ACHUTA HANDMADE — cinematic scroll site

## Run it

Frame sequences load over HTTP, so serve the folder (don't open index.html directly):

```
cd achuta-handmade-site
python3 -m http.server 8080
```

Then open **http://localhost:8080** — or use any static server (`npx serve`, nginx, Netlify, Vercel, GitHub Pages…). No build step, no dependencies.

## What's inside

```
index.html          structure + copy
css/style.css       design system (void black / rose gold, Cormorant Garamond + Jost)
js/app.js           scroll engine — no libraries
seq/hero/           193 frames · clip 1 · hero orbit
seq/macro/          193 frames · clip 2 · macro fly-through
seq/expl/           193 frames · clip 3 · exploded assembly
```

## How it works

- Your three clips were extracted to 579 WebP frames (1600px). Each pinned
  section maps scroll progress → frame index on a full-screen canvas, with
  sub-frame crossfading between adjacent frames for extra smoothness.
- Scrolling stays native; a lerped virtual scroll value (Lenis-style) drives
  every animation, so scrubbing is buttery on wheel, trackpad and touch.
- Hero frames gate the preloader; macro and exploded sequences stream in
  behind it. If you outrun the stream, the nearest loaded frame is shown.
- `prefers-reduced-motion` is respected (no lag, no particles, instant text).

## Easy edits

- **Copy** — all text lives in `index.html`.
- **Overlay timing** — each overlay has `data-show="in-start,in-end,out-start,out-end"`
  as fractions of that section's scroll (e.g. `0.34,0.46,0.60,0.72`).
- **Scroll length per clip** — the `#hero / #macro / #build` heights in `css/style.css`
  (380vh / 380vh / 430vh). Taller = slower scrub.
- **Commission link** — the `mailto:` on the CTA button in `index.html`.
