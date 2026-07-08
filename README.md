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

`builder.html` (linked from the Build your own CTA and the header) is a
parts-catalogue configurator: clients click real parts — case, movement,
dial, handset, sweeping seconds hand — and each choice swaps a transparent
image layer in the live stacked preview. Filter chips above each category
narrow parts by tags (Octagon / Round, Warm / Dark, Baton / Sword, …).
Movements drive compatibility automatically: NH35 adds a date window,
NH36 a day-date, NH38 removes the window, NH34 adds a GMT hand. The seconds hand sweeps like the real movement: six 1-degree
micro-beats per second (21,600 vph), synced to the actual clock so it
reads the true time — a movement entry can set `bps` to change the beat
rate (e.g. 8 for a 28,800 vph calibre). Disabled under
prefers-reduced-motion.

Every configuration produces a **build code** like `AH-445-325Z`:

- One character per part plus a version marker and a checksum, from an
  unambiguous alphabet (no 0/O, 1/I/L, or U).
- Clients hit **Copy code** or **Send commission** (a prefilled email with
  the code and the parts list including vendors).
- **You decode it in the same place:** paste the code into "Have a code?"
  and every part snaps to exactly what the customer chose. Codes work as
  links too — `builder.html#AH-445-325Z` opens preloaded. Mistyped codes
  are rejected by the checksum instead of loading the wrong build.

### Compatibility rules (greying out parts)

Rules live in `js/parts-data.js` next to the parts themselves — no code
changes needed. Give parts physical attributes with `specs`
(e.g. a dial declares `specs: { dial_mm: 31 }`) and let other parts
constrain them with `accepts` (e.g. a case that only takes 28.5 mm dials
declares `accepts: { dial_mm: { max: 28.5 } }` — min / max / equals /
oneOf are supported). For one-off quirks, use explicit lists:
`compatible: { seconds: ["sec-signal"] }` (whitelist) or
`incompatible: { handset: ["hs-sword-gold"] }` (blacklist).

Ex) { id: "case-diver-steel", name: "Diver · steel", ...,
  compatible: { movement: ["mov-nh35", "mov-nh36"] } }

Incompatible parts grey out in BOTH directions with the reason printed
on the card ("Diver · steel fits dials ≤ 28.5 mm — this is 31 mm"), and
greyed parts can't be clicked, so clients can never assemble an invalid
combination. If you tighten rules after issuing codes, old codes still
load exactly as commissioned but show a heads-up naming the conflict.
For live experimenting, open the browser console on the builder page:
edit `ACHUTA.parts`, then call `ACHUTA.refresh()`.

### Adding real vendor parts (Nomad Watch Works, Namoki, DLW, …)

The whole catalogue lives in `js/parts-data.js` — full instructions are at
the top of that file. In short: export the vendor's part photo as a
transparent PNG on the shared 840×1120 canvas (watch centre at exactly
50%/50%, dial ≈ 38% of canvas width), drop it in `/parts`, and APPEND one
entry with name, vendor, url and tags. Never reorder or delete existing
entries — appending keeps every previously issued build code valid. The
included parts were drawn in-house as stand-ins; `tools/gen_parts.html`
regenerates them if you tweak the artwork.

## Easy edits

- **Copy** — all text lives in `index.html`.
- **Overlay timing** — each overlay has `data-show="in-start,in-end,out-start,out-end"`
  as fractions of that section's scroll (e.g. `0.34,0.46,0.60,0.72`).
- **Scroll length per clip** — the `#hero / #macro / #build` heights in `css/style.css`
  (380vh / 380vh / 430vh). Taller = slower scrub.
- **Commission link** — the `mailto:` on the CTA button in `index.html`.
