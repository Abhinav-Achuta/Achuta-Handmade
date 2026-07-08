# ACHUTA HANDMADE — cinematic scroll site

## Run it

Frame sequences load over HTTP, so serve the folder (don't open index.html directly):

```
cd achuta-handmade-site
python3 -m http.server 8080
```

Then open **http://localhost:8080**. To test on your phone, find your
computer's local IP (`ipconfig getifaddr en0` on Mac, `ipconfig` on
Windows) and open `http://THAT-IP:8080` on the same Wi-Fi. Any static
host also works (`npx serve`, nginx, Netlify, Vercel, GitHub Pages…). No build step, no dependencies.

## What's inside

```
index.html          landing page — structure + copy
builder.html        Build-your-own configurator (stacked part layers + build codes)
css/style.css       design system (void black / rose gold, Cormorant Garamond + Jost)
css/builder.css     builder layout, part cards, greyed states, sweep animation
js/app.js           landing-page scroll engine — no libraries
js/parts-data.js    THE PARTS CATALOGUE — parts, vendors, tags, compatibility rules
js/builder.js       builder engine — layers, filters, greying, build codes
parts/              one transparent PNG layer per part (840×1120, shared canvas)
seq/hero|macro|expl 193 frames per film clip for the scroll-scrub sections
tools/gen_parts.html          regenerates the in-house part artwork
tools/alignment-template.png  guide overlay for positioning YOUR part photos
```

## The builder & build codes

`builder.html` (linked from the Build your own CTA and the header) is a
parts-catalogue configurator: clients click real parts — case, band/bracelet,
movement, dial, handset, sweeping seconds hand, date wheel — and each choice swaps a transparent
image layer in the live stacked preview. Filter chips above each category
narrow parts by tags (Octagon / Round, Warm / Dark, Baton / Sword, …).
Movements drive compatibility automatically: NH35 adds a date window,
NH36 a day-date, NH38 removes the window, NH34 adds a GMT hand — and
the window renders in the client's chosen date-wheel colour. The seconds hand sweeps like the real movement: six 1-degree
micro-beats per second (21,600 vph), synced to the actual clock so it
reads the true time — a movement entry can set `bps` to change the beat
rate (e.g. 8 for a 28,800 vph calibre). Disabled under
prefers-reduced-motion.

Every configuration produces a **build code** like `AH-5222-222B`:

- One character per part plus a version marker and a checksum, from an
  unambiguous alphabet (no 0/O, 1/I/L, or U).
- Clients hit **Copy code** or **Send commission** (a prefilled email with
  the code and the parts list including vendors).
- **You decode it in the same place:** paste the code into "Have a code?"
  and every part snaps to exactly what the customer chose. Codes work as
  links too — `builder.html#AH-5222-222B` opens preloaded. Mistyped codes
  are rejected by the checksum instead of loading the wrong build.
- Codes are versioned: codes issued before you add parts or whole
  categories keep loading forever (see HISTORY in `js/builder.js`).

### Layer order — deciding what sits on top

The stacking order of every image is one map at the top of
`js/parts-data.js`:

```js
var LAYERS = { band: 10, movement: 20, dial: 30, window: 40,
               gmt: 45, handset: 50, seconds: 60, case: 70 };
```

Higher number = closer to the viewer. Edit these numbers freely — cases
sit on top by default so the bezel overlaps the dial edge like a real
watch (case PNGs have a transparent dial aperture punched through), the
movement sits at the bottom where it shows through any future skeleton
or cutout dial, and bands sit under everything. Any INDIVIDUAL part can
override its category with its own `layer: <number>` field — e.g. a
domed-crystal part at `layer: 90` to sit above the case. Bands and
cases are separate categories, so any strap pairs with any case.

Note: build codes issued before the band category existed (v2/v3) load
with the default band, since bands weren't encoded back then.

### Adding a whole new category (worked example: Date wheel)

Adding parts to an existing category is append-only in `parts-data.js`.
Adding a NEW category takes four small steps (the date-wheel category in
the shipped files is the worked example to copy):

1. `js/parts-data.js` — append the new category list at the bottom with
   its parts (image, vendor, tags, and any specs/rules).
2. `js/builder.js` — append one line to `CATS` (id, display name, thumb
   class) and add `yourcat: 0` to the initial `state` and `filters`.
3. `js/builder.js` — copy the last line of `HISTORY`, add the new
   category id at the END, and bump `VERSION`. This is what keeps every
   previously issued build code loading: old codes decode against their
   own version's category order, and the new category defaults to its
   first part.
4. If the category is a new visual layer, add an `<img>` to the stack in
   `builder.html` and set its `src` in `applyPreview()`; give its card
   thumbnail a zoom class in `css/builder.css` if needed. (The date
   wheel instead plugs into the movement's window system — movements
   declare window TYPES and the wheel supplies the images.)

Rule of thumb: everything is append-only — parts within a category,
categories within HISTORY — and codes survive any addition.

### Compatibility rules (greying out parts)

Rules live in `js/parts-data.js` next to the parts themselves — no code
changes needed. Give parts physical attributes with `specs`
(e.g. a dial declares `specs: { dial_mm: 31 }`) and let other parts
constrain them with `accepts` (e.g. a case that only takes 28.5 mm dials
declares `accepts: { dial_mm: { max: 28.5 } }` — min / max / equals /
oneOf are supported). For one-off quirks, use explicit lists:
`compatible: { seconds: ["sec-signal"] }` (whitelist) or
`incompatible: { handset: ["hs-sword-gold"] }` (blacklist).

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
transparent PNG on the shared 840×1120 canvas — lay
`tools/alignment-template.png` over your editor canvas as a guide layer
(watch centre at exactly 50%/50%, dial ≈ 38% of canvas width, seconds
hands pointing at 12), delete the guide, export — drop it in `/parts`, and APPEND one
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
