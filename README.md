# ACHUTA HANDMADE — owner's manual

Everything on this site is plain HTML/CSS/JS — no build step, no
frameworks, no database. Edit a file, refresh the browser, done.
This manual covers every feature and exactly which file to open to
change it.

─────────────────────────────────────────────────────────────────────

## 1 · Running the site

Frame sequences and part images load over HTTP, so serve the folder
(don't double-click index.html):

```
cd Achuta-Handmade-main
python3 -m http.server 8080          → open http://localhost:8080
```

**Test on your phone:** find your computer's local IP
(`ipconfig getifaddr en0` on Mac, `ipconfig` on Windows) and open
`http://THAT-IP:8080` on the same Wi-Fi.

**Deploy:** any static host works as-is — there is no build step, so
every host's "build command" is blank and the publish directory is the
folder root. Recommended: Cloudflare Pages (free, unlimited bandwidth —
this site's frame sequences make bandwidth the one thing that matters).
The `_headers` file at the root gives the heavy assets a 7-day cache on
Cloudflare Pages and Netlify automatically. Avoid Vercel's free tier
(non-commercial only) for this business site.

## 2 · What's in the folder

```
index.html        landing page (cinematic scroll)
builder.html      Build-your-own configurator
faq.html          FAQ (accordions, deep-linkable)
gallery.html      Gallery of commissions with loadable build codes

css/style.css     design tokens + shared header/nav (ALL pages load this)
css/builder.css   configurator styles, cards, mini-bar, sweep
css/faq.css       FAQ styles
css/gallery.css   gallery styles

js/app.js         landing scroll engine  — LANDING PAGE ONLY
js/nav.js         mobile menu            — every page
js/parts-data.js  ★ THE CATALOGUE — parts, prices, rules, layers
js/builder.js     configurator engine (rarely needs editing)
js/faq.js         FAQ accordions

parts/            one transparent PNG per part (840×1120 shared canvas)
gallery/          commission photos
seq/hero|macro|expl   193 frames per film clip (landing scrub)
tools/gen_parts.html          regenerates the drawn part artwork
tools/alignment-template.png  guide overlay for positioning YOUR photos
tools/page-template.html      copy this to create a new page
```

★ = the file you'll edit most. Its top comment repeats the key rules.

## 3 · The golden rules (read these twice)

1. **APPEND, never reorder or delete** — parts within a category,
   categories within HISTORY. Build codes store positions; reordering
   makes old customer codes point at the wrong parts. Retiring a part?
   Leave its entry in place (you can stop linking its image later).
2. **ids are forever.** Part `id`s are referenced by whitelists and by
   you; don't rename one once codes exist.
3. **After editing rules, open the browser console** on the builder —
   misconfigured rules print plain-language warnings there.

─────────────────────────────────────────────────────────────────────

## 4 · Landing page (index.html)

Three film clips were pre-extracted to WebP frames; scrolling scrubs
them on canvas with Lenis-style smoothing (js/app.js, no libraries).

- **Copy** — all text is in `index.html`.
- **Overlay timing** — every pinned caption has
  `data-show="in-start,in-end,out-start,out-end"` as fractions of that
  section's scroll (e.g. `0.34,0.46,0.60,0.72`).
- **Scrub speed** — the `#hero / #macro / #build` heights in
  `css/style.css` (380vh / 380vh / 430vh). Taller = slower.
- **Swapping a film clip** — extract new frames over the old ones:
  `ffmpeg -i NEW.mp4 -vf "scale=1600:-2" -c:v libwebp -q:v 80
  seq/macro/f_%04d.webp` (193 frames expected; if the count differs,
  update `count` in SEQS at the top of js/app.js).
- The landing header fades in on scroll (app.js adds class `on`);
  every other page hardcodes `class="site-head on"`. **Never include
  js/app.js on other pages.**

## 5 · Header & navigation (all pages)

- **Wordmark** is a two-line lockup — ACHUTA over HANDMADE (gold).
  Styles under "two-line wordmark" in css/style.css; the HANDMADE
  letter-spacing is tuned so both lines are the same width.
- **Tab order** everywhere: The story/About · Commission · FAQ ·
  Gallery, with `aria-current="page"` on the current page.
- **Mobile (≤760px):** only the first two tabs show; FAQ + Gallery live
  behind the Menu button (js/nav.js — closes on outside tap, Escape,
  or choosing a link). Desktop is untouched.
- **Adding a tab:** add the link inside `<nav class="head-nav">` on
  EVERY page. Put it before the `<button class="nav-more">` to keep it
  always visible on mobile, or inside `<div class="nav-extra">` to put
  it in the mobile menu.

## 6 · FAQ (faq.html)

Questions are plain HTML — duplicate a `.q` block to add one. Give it
an `id` to make it deep-linkable (`faq.html#q-how` opens + scrolls to
it, also on hash changes). Answers are DRAFTS — especially confirm the
timeline ("two to four weeks") and warranty wording.

## 7 · Gallery (gallery.html)

Each card = a photo in `/gallery` + the commission's real build code.
"Load this build" is just a link to `builder.html#CODE`. To add one:
duplicate an `<article>`, drop the photo in `/gallery`, and paste the
code into BOTH the visible line and the link's hash. Until you shoot
the real watch, a composite of catalogue parts works (the three
shipped photos were made that way).

## 8 · Adding a whole new page

Copy `tools/page-template.html` to the SITE ROOT, rename it, and
follow the numbered comments inside. It already carries the header,
footer, fonts, tokens, and mobile menu. Then add its nav link on every
page (rule in §5). The FAQ is a finished example of the pattern.

─────────────────────────────────────────────────────────────────────

## 9 · THE CONFIGURATOR

### 9.1 How it works in one paragraph

Eight categories (case, band, movement, dial, handset, seconds hand,
GMT hand, date wheel). Every part is a transparent PNG layer on a shared 840×1120
canvas; the preview stacks the selected layers in z-order. Everything —
parts, prices, rules, layer order — lives in **js/parts-data.js**.
The engine (js/builder.js) reads it; you almost never edit the engine.

### 9.2 A part entry, every field explained

```js
{ id: "case-royal-oak-rose",        // permanent — never rename
  name: "Royal Oak · rose gold",    // shown on the card
  vendor: "nomods", url: "",        // shown on card + commission email
  price: 105,                       // card chip + running total; 0 = "Included"; omit = no chip
  tags: ["Royal Oak", "Rose gold"], // become the filter chips
  img: "parts/case-royal-oak-rose.png",
  note: "Octagonal bezel",          // small line on the card (optional)

  // colour variants (optional):
  group: "royal-oak",               // same group ⇒ ONE card with colour dots
  swatch: "#c98a5f",                // this variant's dot colour

  // compatibility (optional — see 9.5):
  specs:    { dial_mm: 28.5 },              // facts about THIS part
  accepts:  { dial_mm: { max: 28.5 } },     // limits it puts on others
  compatible:   { band: ["band-x-id"] },    // whitelist per category
  incompatible: { seconds: ["sec-x-id"] },  // blacklist per category

  layer: 90 }                       // optional per-part z-order override
```

Category-specific extras: **movements** have `windows: ["date"]` /
`["daydate"]` / `[]` / `["date","gmt"]` (which aperture/hand overlays
they add), `bps: 6` (sweep beats per second — 8 for a 28,800 vph
calibre), and `spec:` (the line under the preview). **Handsets** have
`includedSeconds: "parts/….png"` — the hand their kit ships with.
**Date wheels** have `imgs: { date, daydate }` (their window images).
**GMT hands** are a whole category that only applies with a GMT
movement — see §9.10. The special seconds part with
`matchesHandset: true` renders the selected handset's included hand;
`featured: true` floats any part to the front of its grid WITHOUT
changing its code index.

### 9.3 Adding / replacing part images

- **Replace:** overwrite the PNG in `/parts` with the same filename.
- **Add:** transparent PNG on the 840×1120 canvas, then APPEND one
  entry to the category in parts-data.js. Lay
  `tools/alignment-template.png` over your editor canvas as a guide:
  watch centre exactly 50%/50%, dial ø ≈ 38% of canvas width.
  Cases include bezel + crown with the DIAL AREA TRANSPARENT (cases
  render on top); bands are separate; dials include their indices;
  handsets pose at 10:08; **seconds hands point straight up at 12**
  (the layer rotates live to sweep). Card thumbnails auto-crop — the
  per-category zoom lives in css/builder.css (.t-case, .t-dial, …).
- The drawn stand-in parts can be regenerated from
  tools/gen_parts.html (see comments in that file).

### 9.4 Colour variants — worked example

Live example: the two `royal-oak` case entries. Two edits: add
`group: "royal-oak", swatch: "#c98a5f"` to the existing colour, then
APPEND the new colourway at the END of the list with the same group
and its own swatch/image/price. They collapse into one card with
colour dots; each colour keeps its own code index and may carry its
own rules. Incompatible colours grey per-dot. Quick stand-in image: a
luminance remap of the existing colour's PNG (the steel Royal Oak was
made that way).

### 9.5 Compatibility (greying parts out)

Two styles, both written on the parts:

- **Whitelist/blacklist** — best for "only these parts":
  `compatible: { band: ["band-bracelet-rose"] }` on a case greys every
  other band, in both directions, with the reason on the card.
- **Numbers** — best for measurements: a dial declares
  `specs: { dial_mm: 31 }`; a case declares
  `accepts: { dial_mm: { max: 28.5 } }`. Comparators: min, max,
  equals, oneOf — shorthand `{ k: "value" }` means equals, an array
  means oneOf. **A part that doesn't declare a spec is never
  constrained by it** — that's why whitelists are better for
  "only accepts X".

Clients can never build an invalid combo (greyed parts don't click).
Codes issued before a rule tightened still load, with a heads-up.
Bad rules (unknown comparators, category-as-spec, unknown ids, specs
nothing declares) print console warnings when the builder loads.
Live experiments: edit `ACHUTA.parts` in the console, then
`ACHUTA.refresh()`.

### 9.6 Prices & the estimate

`price:` per part → card chip + "Estimated parts total" + a line in
the commission email. Currency + disclaimer are in the `PRICING` block
at the top of parts-data.js. Prices are NEVER stored in codes — old
codes re-price at today's numbers. **All seeded prices are
placeholders.**

### 9.7 Layer order

The `LAYERS` map at the top of parts-data.js (band 10 · movement 20 ·
dial 30 · window 40 · gmt 45 · handset 50 · seconds 60 · case 70).
Higher = closer to the viewer. Cases sit on top (their transparent
aperture shows the dial); the movement shows through cutout/open-heart
dials. Any single part can override with `layer:`.

### 9.8 Build codes & versions

A code (e.g. `AH-6222-2722R`) = version + one character per category +
checksum, from an alphabet with no confusable characters. Decode a
customer's code in "Have a code?" (or link `builder.html#CODE`) and
every part snaps to their choices. The checksum rejects typos.

`HISTORY` in js/builder.js maps each code version to its category
order. **Adding a category:** append its parts list in parts-data.js;
append one line to `CATS` + add `yourcat: 0` to `state` and `filters`
in builder.js; copy the last HISTORY line, append the new id, bump
`VERSION`. Old codes keep loading (new categories default to their
first part). If it's a visual layer, add an `<img>` to the stack in
builder.html + one line in `applyPreview()`. The date wheel is the
worked example of all of this; the GMT hand (§9.10) adds one twist —
a category gated on the selected movement.

### 9.9 Built-in behaviours (nothing to configure)

- **Mechanical sweep:** the seconds layer steps 6×/second (steps(360)
  over 60s), synced to the real clock; static under reduced-motion.
- **Included seconds hand** is the default and follows the handset.
- **Collapsible categories:** the triangle in each header folds it;
  the current pick stays visible in the header.
- **My builds:** clients save up to 8 builds per browser
  (localStorage); rows show name, code, date, today's price.
- **Mobile mini-bar (≤980px):** live mini-preview + total pinned to
  the bottom once the big preview scrolls away; "Preview ↑" returns.
- **Filters** come from tags automatically; **codes react to hash
  changes**, so gallery links swap builds without a reload.

### 9.10 GMT hands (only with a GMT movement)

The **GMT hand** category is tied to the movement: a `CATS` entry in
builder.js may declare `requiresWindow: "gmt"`, and the category then
only applies while the selected movement lists that token in its
`windows:` (today that's the NH34, `windows: ["date","gmt"]`).

With any other movement the whole section greys out with a note
(text is the `naNote:` on the `CATS` entry), its cards stop reacting,
its price leaves the running estimate, and the commission email omits
it. Pick the NH34 and it wakes up: the chosen hand renders through the
movement's gmt overlay slot at `LAYERS.gmt` (a part can still override
with `layer:`) and its price rejoins the total.

The customer's GMT-hand pick is always stored in the build code —
switching to a non-GMT movement leaves it encoded but dormant, exactly
like a date wheel on a no-date movement, so nothing is lost by
toggling movements. New hands: draw them in tools/gen_parts.html in
the same 128° pose as the stock hand (so they composite identically),
export to /parts, APPEND to `gmthand` in parts-data.js. The stock red
hand ships with the NH34, so it's `price: 0` ("Included").

─────────────────────────────────────────────────────────────────────

## 10 · Troubleshooting

- **Seconds hand not moving?** OS "Reduce Motion" is on (that's
  deliberate), or you're viewing cached/old files — hard-refresh.
- **A rule isn't greying anything?** Open the builder's console — the
  lint tells you what's wrong. Usual cause: `accepts` against a spec
  the target parts never declare → use `compatible:` instead.
- **A new image sits misaligned?** Re-export over
  tools/alignment-template.png; centre must be exactly 50%/50%.
- **An old code shows an error?** v1/v2/v3 codes still load (older,
  shorter formats); a "doesn't check out" message means a typo —
  one character is wrong.

## 11 · Design language (for anything new)

Tokens in css/style.css: `--void` (black), `--bone` (warm white),
`--gold` (accent), `--serif` (Cormorant Garamond — display),
`--sans` (Jost — labels, letterspaced uppercase). Prose over boxes,
hairlines over borders, gold sparingly, very few words.
