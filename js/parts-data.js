/* ═══════════════════════════════════════════════════════
   ACHUTA HANDMADE — parts catalogue
   ─────────────────────────────────────────────────────────
   ADDING A REAL VENDOR PART (e.g. from Nomad Watch Works,
   Namoki, Crystaltimes, DLW …):

   1. Save a transparent PNG of the part, aligned on the same
      840×1120 canvas (watch centre at exactly 50%/50%,
      dial diameter ≈ 38% of canvas width) into /parts.
      • cases include bezel, crown and strap/bracelet
      • dials include indices and minute track
      • handsets are hour+minute set at 10:08
      • seconds hands are drawn pointing at 12 (they sweep live)
   2. APPEND an entry to the END of the category list below —
      never reorder or delete entries, or previously issued
      build codes will point at the wrong parts.
   3. COMPATIBILITY RULES (all optional, all owner-editable):
      • specs:   physical attributes of THIS part,
                 e.g.  specs: { dial_mm: 28.5 }
      • accepts: constraints THIS part imposes on any other part
                 that declares the matching spec, e.g. a case that
                 only takes dials up to 28.5 mm:
                 accepts: { dial_mm: { max: 28.5 } }
                 Supported: { min, max, equals, oneOf: [...] }
      • compatible:   explicit whitelist per category, e.g.
                      compatible: { handset: ["hs-baton-rose"] }
                      (parts NOT listed are greyed out)
      • incompatible: explicit blacklist per category, e.g.
                      incompatible: { seconds: ["sec-lollipop"] }
      Parts that don't declare a spec are never constrained by it.
      Incompatible parts grey out in BOTH directions with the reason
      shown on the card, so clients can never build an invalid combo.
   4. movements may set bps (beats per second) — the preview's
      sweep steps at 60×bps micro-ticks per minute (default 6,
      i.e. 21,600 vph; a 28,800 vph movement would be bps: 8).
   5. vendor + url are shown on the card and included in the
      commission email.
   ═══════════════════════════════════════════════════════ */

var PARTS = {

  case: [
    { id: "case-oct-rose",    name: "Octagon · rose gold", vendor: "ACHUTA stock", url: "",
      tags: ["Octagon", "Rose gold", "Bracelet"], img: "parts/case-oct-rose.png",
      note: "Integrated bracelet" },
    { id: "case-oct-steel",   name: "Octagon · steel", vendor: "ACHUTA stock", url: "",
      tags: ["Octagon", "Steel", "Bracelet"], img: "parts/case-oct-steel.png",
      note: "Integrated bracelet" },
    { id: "case-diver-steel", name: "Diver · steel", vendor: "ACHUTA stock", url: "",
      tags: ["Round", "Steel", "Rubber"], img: "parts/case-diver-steel.png",
      note: "120-click bezel · rubber strap · fits dials ≤ 28.5 mm",
      accepts: { dial_mm: { max: 28.5 } } },
    { id: "case-cushion-onyx", name: "Cushion · onyx", vendor: "ACHUTA stock", url: "",
      tags: ["Cushion", "Onyx", "Leather"], img: "parts/case-cushion-onyx.png",
      note: "Leather noir strap · fits dials ≤ 28.5 mm",
      accepts: { dial_mm: { max: 28.5 } } }
  ],

  movement: [
    { id: "mov-nh35", name: "Seiko NH35", vendor: "Seiko · TMI", url: "",
      tags: ["Date", "Hacking"], img: "parts/mov-nh35.png",
      overlays: ["parts/ovl-date.png"], bps: 6,
      spec: "Automatic · date · 21,600 vph · sweeping seconds" },
    { id: "mov-nh36", name: "Seiko NH36", vendor: "Seiko · TMI", url: "",
      tags: ["Day-date", "Hacking"], img: "parts/mov-nh36.png",
      overlays: ["parts/ovl-daydate.png"], bps: 6,
      spec: "Automatic · day-date · 21,600 vph · sweeping seconds" },
    { id: "mov-nh38", name: "Seiko NH38", vendor: "Seiko · TMI", url: "",
      tags: ["No date", "Hacking"], img: "parts/mov-nh38.png",
      overlays: [], bps: 6,
      spec: "Automatic · no date · clean dial · sweeping seconds" },
    { id: "mov-nh34", name: "Seiko NH34 GMT", vendor: "Seiko · TMI", url: "",
      tags: ["GMT", "Date"], img: "parts/mov-nh34.png",
      overlays: ["parts/ovl-date.png", "parts/ovl-gmt.png"], bps: 6,
      spec: "Automatic · true GMT · date · sweeping seconds" }
  ],

  dial: [
    { id: "dial-salmon", name: "Salmon tapisserie", vendor: "ACHUTA stock", url: "",
      tags: ["Warm", "Tapisserie"], img: "parts/dial-salmon.png", note: "ø 28.5 mm", specs: { dial_mm: 28.5 } },
    { id: "dial-blue",   name: "Midnight tapisserie", vendor: "ACHUTA stock", url: "",
      tags: ["Cool", "Tapisserie"], img: "parts/dial-blue.png", note: "ø 28.5 mm", specs: { dial_mm: 28.5 } },
    { id: "dial-forest", name: "Forest tapisserie", vendor: "ACHUTA stock", url: "",
      tags: ["Cool", "Tapisserie"], img: "parts/dial-forest.png", note: "ø 28.5 mm", specs: { dial_mm: 28.5 } },
    { id: "dial-noir",   name: "Noir sunburst", vendor: "ACHUTA stock", url: "",
      tags: ["Dark", "Sunburst"], img: "parts/dial-noir.png", note: "ø 28.5 mm", specs: { dial_mm: 28.5 } },
    { id: "dial-fume",   name: "Charcoal fumé", vendor: "ACHUTA stock", url: "",
      tags: ["Dark", "Sunburst"], img: "parts/dial-fume.png", note: "ø 28.5 mm", specs: { dial_mm: 28.5 } },
    { id: "dial-ivory",  name: "Ivory matte", vendor: "ACHUTA stock", url: "",
      tags: ["Light", "Matte"], img: "parts/dial-ivory.png", note: "ø 31 mm", specs: { dial_mm: 31 } }
  ],

  handset: [
    { id: "hs-baton-rose",     name: "Baton · rose gold", vendor: "ACHUTA stock", url: "",
      tags: ["Baton", "Rose gold"], img: "parts/hs-baton-rose.png" },
    { id: "hs-baton-steel",    name: "Baton · steel", vendor: "ACHUTA stock", url: "",
      tags: ["Baton", "Steel"], img: "parts/hs-baton-steel.png" },
    { id: "hs-sword-gold",     name: "Sword · gold", vendor: "ACHUTA stock", url: "",
      tags: ["Sword", "Gold"], img: "parts/hs-sword-gold.png" },
    { id: "hs-dauphine-steel", name: "Dauphine · steel", vendor: "ACHUTA stock", url: "",
      tags: ["Dauphine", "Steel"], img: "parts/hs-dauphine-steel.png" },
    { id: "hs-arrow-onyx",     name: "Arrow · onyx", vendor: "ACHUTA stock", url: "",
      tags: ["Arrow", "Onyx"], img: "parts/hs-arrow-onyx.png" },
    { id: "hs-alpha-rose",     name: "Alpha · rose gold", vendor: "ACHUTA stock", url: "",
      tags: ["Alpha", "Rose gold"], img: "parts/hs-alpha-rose.png" }
  ],

  seconds: [
    { id: "sec-thin-rose",  name: "Thin sweep · rose gold", vendor: "ACHUTA stock", url: "",
      tags: ["Rose gold", "Thin"], img: "parts/sec-thin-rose.png" },
    { id: "sec-thin-steel", name: "Thin sweep · steel", vendor: "ACHUTA stock", url: "",
      tags: ["Steel", "Thin"], img: "parts/sec-thin-steel.png" },
    { id: "sec-lollipop",   name: "Lollipop sweep · lume", vendor: "ACHUTA stock", url: "",
      tags: ["Lume", "Lollipop"], img: "parts/sec-lollipop.png" },
    { id: "sec-signal",     name: "Signal sweep · red", vendor: "ACHUTA stock", url: "",
      tags: ["Red", "Thin"], img: "parts/sec-signal.png" },
    { id: "sec-arrow-gold", name: "Arrow sweep · gold", vendor: "ACHUTA stock", url: "",
      tags: ["Gold", "Arrow"], img: "parts/sec-arrow-gold.png" }
  ]
};
