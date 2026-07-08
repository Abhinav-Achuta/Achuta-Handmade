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
builder.html        Build-your-own configurator (live watch + build codes)
css/style.css       design system (void black / rose gold, Cormorant Garamond + Jost)
css/builder.css     builder page layout
js/app.js           scroll engine — no libraries
js/builder.js       configurator + build-code encode/decode
seq/hero/           193 frames · clip 1 · hero orbit
seq/macro/          193 frames · clip 2 · macro fly-through
seq/expl/           193 frames · clip 3 · exploded assembly
```

## The builder & build codes

`builder.html` (linked from the Build your own CTA and the header) lets clients
assemble a watch part by part — case, bezel, dial, hands, seconds hand, indices,
bracelet/strap, date — with a live rendering. Movement is fixed as Seiko NH35.

Every configuration produces a **build code** like `AH-34232-52334`:

- One character per part choice plus a version marker and a checksum, drawn
  from an unambiguous alphabet (no 0/O, 1/I/L, or U).
- Clients hit **Copy code** or **Send commission** (a prefilled email carrying
  the code and the full parts list).
- **You decode it the same place:** open the builder, paste the code into
  "Have a code?", and every part snaps to exactly what the customer chose.
  Codes also work as links — `builder.html#AH-34232-52334` opens preloaded.
- The checksum catches typos: a mistyped character is rejected with a message
  instead of silently loading the wrong build.
- Adding parts later? Append options to the END of a category's list in
  `js/builder.js` (never reorder existing ones) and old codes stay valid.

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
