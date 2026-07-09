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
faq.html            FAQ page — accordion answers, deep-linkable (faq.html#q-how)
gallery.html        Commissions gallery — photos paired with loadable build codes
gallery/            commission photos
css/style.css       design system (void black / rose gold, Cormorant Garamond + Jost)
css/builder.css     builder layout, part cards, greyed states, sweep animation
js/app.js           landing-page scroll engine — no libraries
js/parts-data.js    THE PARTS CATALOGUE — parts, vendors, tags, compatibility rules
js/builder.js       builder engine — layers, filters, greying, build codes
js/faq.js           FAQ accordions
css/faq.css         FAQ page styles
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
narrow parts by tags (Octagon / Round, Warm / Dark, Baton / Sword, …),
and each category collapses behind the small triangle in its header —
the current pick stays visible while collapsed.
Handsets ship with a matching seconds hand: the "Included with
handset" option (the default) renders whichever hand matches the chosen
handset and follows it live — picking any other seconds hand is the
upgrade path, declared per handset via `includedSeconds` in
`parts-data.js`. Movements drive compatibility automatically: NH35 adds a date window,
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

### Gallery, saved builds & the mobile summary bar

- **Commissions gallery** (`gallery.html`): each card pairs a photo in
  `/gallery` with its real build code — "Load this build" is just a
  link to `builder.html#CODE`. To add one, duplicate an `<article>`
  block and paste the commission's code into the visible line AND the
  link's hash. Composites of catalogue parts work as photos until you
  shoot the real watch.
- **My builds**: clients can save up to 8 builds per browser
  (localStorage, no accounts). Rows show name, code, date, and the
  price at TODAY's numbers. Saving the same code twice keeps one entry.
- **Mobile summary bar**: below 980px, a pinned strip with a live
  mini-preview and the running total appears whenever the big preview
  scrolls out of view; "Preview ↑" jumps back. It never renders on
  desktop.
- Build-code links now also react to hash changes, so flipping between
  gallery links without a reload swaps the build live.

### Adding a new page (About, Journal, Contact, …)

Copy `tools/page-template.html` into the site root, rename it
(e.g. `about.html`), and follow the numbered comments inside — it
already carries the shared header, footer, fonts, and design tokens.
The one integration rule: when a page is added, put its nav link into
`<nav class="head-nav">` on EVERY page (index.html, builder.html,
faq.html, and the new page itself) so navigation stays consistent
everywhere. Two quirks worth knowing: the landing page's header fades
in on scroll (js/app.js adds the `on` class), while every other page
hardcodes `class="site-head on"`; and js/app.js is landing-only —
never include it on other pages. The FAQ page is a finished example of
the pattern, including how to add a small page script (js/faq.js).

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

### Prices & the running estimate

Give any part a `price:` in `js/parts-data.js` and it appears as a chip
on the card and joins the "Estimated parts total" above the build code,
which recomputes on every selection and rides along in the commission
email. `price: 0` displays as "Included" (the with-handset seconds hand
and stock white date wheel use this); omit `price` to show nothing.
Currency symbol and the disclaimer line live in the `PRICING` block at
the top of the same file. Prices are never stored in build codes —
loading an old code prices it at today's numbers. ALL SEEDED PRICES ARE
PLACEHOLDERS — edit them.

### Colour variants (one card, colour dots) — worked example

Parts that come in several colours can render as ONE card with a colour
dot per variant. The live example in the shipped catalogue is the Royal
Oak case (rose + steel). Creating it took two edits in
`js/parts-data.js`:

**Edit 1 — tag the existing part with a group and a dot colour:**

```js
{ id: "case-royal-oak-rose", name: "Royal Oak · rose gold", vendor: "nomods", ...
  group: "royal-oak", swatch: "#c98a5f",
  ...all other fields unchanged... },
```

**Edit 2 — APPEND the new colourway at the END of its category list,
same `group`, its own `swatch` (and its image in `/parts`):**

```js
{ id: "case-royal-oak-steel", name: "Royal Oak · steel", vendor: "nomods", url: "",
  group: "royal-oak", swatch: "#cfd2d6", price: 95,
  tags: ["Royal Oak", "Steel"], img: "parts/case-royal-oak-steel.png",
  note: "Octagonal bezel · 37mm lug-to-lug",
  accepts: { mov_brand: "nh" },
  compatible: { band: ["band-bracelet-rose"] } }
```

That's the whole recipe: same `group` string, one `swatch` per variant.
The entries collapse into a single card; pressing a dot swaps the
preview image, the card's name and price chip, and the build code. A
third colour is just another appended entry with the same group — its
dot appears automatically.

Rules of the road:

- **Append-only still applies.** New colourways go at the END of the
  category list, never inserted beside their siblings — grouping is by
  the `group` string, not by position, so previously issued codes are
  untouched.
- **Each variant is its own part** with its own code index, price,
  image, and (optionally) its own compatibility rules — two colourways
  may allow different bracelets simply by listing different ids.
- **Codes distinguish colours**, so a commission tells you exactly
  which colourway to build.
- **Incompatible colours grey per-dot**, not per-card: if only the
  steel variant conflicts with the current build, only its dot dims
  (with the reason on hover) while the rose dot stays selectable.
- Need a quick stand-in image for a new colourway? A luminance remap of
  the existing colour's PNG works well until the real render exists
  (the shipped steel Royal Oak was made exactly that way).

### Compatibility rules (greying out parts)

Rules live in `js/parts-data.js` next to the parts themselves — no code
changes needed. Give parts physical attributes with `specs`
(e.g. a dial declares `specs: { dial_mm: 31 }`) and let other parts
constrain them with `accepts` (e.g. a case that only takes 28.5 mm dials
declares `accepts: { dial_mm: { max: 28.5 } }` — min / max / equals /
oneOf are supported). Shorthand also works: `accepts: { band_style: "royal-oak" }` means
equals, and an array means oneOf. IMPORTANT: `accepts` only constrains
parts that DECLARE the matching spec — a bracelet without
`specs: { band_style: … }` is deliberately never greyed. So for
"this case only takes bracelet X", prefer the whitelist on the case:
`compatible: { band: ["band-x-id"] }`. Misconfigured rules (unknown
categories, unknown part ids, accepts keys nothing declares) print
warnings in the browser console when the builder loads.

For one-off quirks, use explicit lists:
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

- **Copy** — landing text lives in `index.html`; FAQ questions and
  answers are plain HTML blocks in `faq.html` (copy a `.q` block to add
  one; answers are DRAFTS — edit timelines/warranty wording to match
  your actual policies).
- **Overlay timing** — each overlay has `data-show="in-start,in-end,out-start,out-end"`
  as fractions of that section's scroll (e.g. `0.34,0.46,0.60,0.72`).
- **Scroll length per clip** — the `#hero / #macro / #build` heights in `css/style.css`
  (380vh / 380vh / 430vh). Taller = slower scrub.
- **Commission link** — the `mailto:` on the CTA button in `index.html`.
