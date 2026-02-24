/**
 * Bibliotheca Obscura — Figma Design System Import
 * ─────────────────────────────────────────────────
 * Paste this script into the Figma Developer Console to create:
 *   • Local Color Styles  (grouped: accent/, background/, border/, text/)
 *   • Local Text Styles   (grouped: display/, body/, ui/)
 *   • Component frames on a new "Design System" page
 *
 * HOW TO RUN:
 *   1. Open your Figma file
 *   2. Press Cmd+/ → search "Developer Console"  (or Plugins → Development → Open Console)
 *   3. Copy this entire file, paste into the console, press Enter
 */

(async () => {

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Convert "#rrggbb" or "rgba(r,g,b,a)" to Figma {r,g,b,a} 0–1 */
  function hex(h) {
    h = h.trim();
    if (h.startsWith('rgba')) {
      const [r, g, b, a] = h.match(/[\d.]+/g).map(Number);
      return { r: r/255, g: g/255, b: b/255, a };
    }
    const n = parseInt(h.replace('#', ''), 16);
    return { r: ((n >> 16) & 255)/255, g: ((n >> 8) & 255)/255, b: (n & 255)/255, a: 1 };
  }

  function solidPaint(hexStr) {
    const { r, g, b, a } = hex(hexStr);
    return [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
  }

  function em(px, em) { return px * em; } // convert em relative to base px

  // ─── Token Data ──────────────────────────────────────────────────────────────

  const COLORS = [
    // background
    { name: 'background/bg',        hex: '#0c0a08' },
    { name: 'background/surface',   hex: '#131109' },
    { name: 'background/surface-2', hex: '#1a1812' },
    { name: 'background/surface-3', hex: '#201e16' },
    { name: 'background/surface-4', hex: '#272418' },
    // border
    { name: 'border/dim',           hex: '#1e1b13' },
    { name: 'border/default',       hex: '#332d20' },
    { name: 'border/mid',           hex: '#443d2c' },
    { name: 'border/accent',        hex: '#5a5038' },
    // accent / gold
    { name: 'accent/gold',          hex: '#c8973e' },
    { name: 'accent/gold-light',    hex: '#e2b55a' },
    { name: 'accent/gold-dim',      hex: '#7d5e24' },
    { name: 'accent/gold-subtle',   hex: 'rgba(200,151,62,0.10)' },
    { name: 'accent/gold-glow',     hex: 'rgba(200,151,62,0.06)' },
    // accent / green
    { name: 'accent/green',         hex: '#3a6649' },
    { name: 'accent/green-light',   hex: '#5a9470' },
    { name: 'accent/green-subtle',  hex: 'rgba(58,102,73,0.14)' },
    // text
    { name: 'text/cream',           hex: '#e8ddc4' },
    { name: 'text/default',         hex: '#c8bc9e' },
    { name: 'text/muted',           hex: '#a08f77' },
    { name: 'text/red',             hex: '#b84a38' },
  ];

  // Text styles: [name, fontFamily, fontSize, fontWeight, letterSpacing (px), lineHeight (px|null)]
  const TEXT_STYLES = [
    ['display/h1',      'Playfair Display', 44,   'Bold',    -0.88,  48.4],
    ['display/h2',      'Playfair Display', 24.8, 'SemiBold',-0.248, 29.8],
    ['display/h3',      'Playfair Display', 23.2, 'Regular',  0,     30.2],
    ['display/stat',    'Playfair Display', 36.8, 'Bold',    -0.736, 36.8],
    ['body/default',    'EB Garamond',      17,   'Regular',  0,     27.2],
    ['body/muted',      'EB Garamond',      15.5, 'Regular',  0,     24.8],
    ['body/synopsis',   'EB Garamond',      15.5, 'Regular',  0,     26.4],
    ['ui/eyebrow',      'EB Garamond',      13.3, 'Regular',  2.926, 13.3],
    ['ui/label',        'EB Garamond',      13.9, 'Regular',  1.39,  13.9],
    ['ui/badge',        'EB Garamond',      13.6, 'Regular',  0.816, 13.6],
    ['ui/button',       'EB Garamond',      15.3, 'Regular',  1.224, 15.3],
    ['ui/tab',          'EB Garamond',      15,   'Regular',  1.5,   15],
  ];

  // ─── Create Color Styles ─────────────────────────────────────────────────────

  console.log('Creating color styles…');
  for (const { name, hex: h } of COLORS) {
    // Check if style already exists
    const existing = figma.getLocalPaintStyles().find(s => s.name === name);
    const style = existing || figma.createPaintStyle();
    style.name = name;
    style.paints = solidPaint(h);
  }
  console.log(`  ✓ ${COLORS.length} color styles`);

  // ─── Create Text Styles ──────────────────────────────────────────────────────

  console.log('Creating text styles…');
  for (const [name, family, size, weight, ls, lh] of TEXT_STYLES) {
    const existing = figma.getLocalTextStyles().find(s => s.name === name);
    const style = existing || figma.createTextStyle();
    style.name = name;

    await figma.loadFontAsync({ family, style: weight });
    style.fontName    = { family, style: weight };
    style.fontSize    = size;
    style.letterSpacing = { value: ls, unit: 'PIXELS' };
    if (lh) style.lineHeight = { value: lh, unit: 'PIXELS' };
  }
  console.log(`  ✓ ${TEXT_STYLES.length} text styles`);

  // ─── Create Design System Page ───────────────────────────────────────────────

  let dsPage = figma.root.children.find(p => p.name === 'Design System');
  if (!dsPage) {
    dsPage = figma.createPage();
    dsPage.name = 'Design System';
  }
  figma.currentPage = dsPage;

  // Token shorthand helpers (resolve to hex string)
  const C = {
    bg:        '#0c0a08', surface:  '#131109', surface2: '#1a1812',
    surface3:  '#201e16', surface4: '#272418',
    borderDim: '#1e1b13', border:   '#332d20', borderMid: '#443d2c', borderAccent: '#5a5038',
    gold:      '#c8973e', goldL:    '#e2b55a', goldDim:   '#7d5e24',
    goldS:     'rgba(200,151,62,0.10)',
    green:     '#3a6649', greenL:   '#5a9470',
    cream:     '#e8ddc4', text:     '#c8bc9e', muted:     '#a08f77', red: '#b84a38',
  };

  // Font load helpers
  const loadFonts = async (...pairs) => {
    for (const [family, style] of pairs) await figma.loadFontAsync({ family, style });
  };

  await loadFonts(
    ['Playfair Display', 'Bold'], ['Playfair Display', 'Regular'], ['Playfair Display', 'SemiBold'],
    ['EB Garamond', 'Regular'],
  );

  // ─── Layout constants ────────────────────────────────────────────────────────
  const COL   = 920;    // frame width
  const PAD   = 40;     // standard horizontal padding
  const GAP   = 32;     // gap between frames
  let   yPos  = 0;

  function place(frame) {
    frame.x = 0;
    frame.y = yPos;
    yPos += frame.height + GAP;
    return frame;
  }

  // ─── Helper: create text node ────────────────────────────────────────────────
  function makeText(str, family, weight, size, color, opts = {}) {
    const t = figma.createText();
    t.fontName = { family, style: weight };
    t.fontSize = size;
    t.characters = str;
    const { r, g, b, a } = hex(color);
    t.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a ?? 1 }];
    if (opts.ls != null) t.letterSpacing = { value: opts.ls, unit: 'PIXELS' };
    if (opts.lh != null) t.lineHeight = { value: opts.lh, unit: 'PIXELS' };
    if (opts.textCase) t.textCase = opts.textCase;
    if (opts.x != null) t.x = opts.x;
    if (opts.y != null) t.y = opts.y;
    if (opts.w != null) { t.textAutoResize = 'HEIGHT'; t.resize(opts.w, t.height); }
    return t;
  }

  function makeRect(w, h, fill, opts = {}) {
    const r = figma.createRectangle();
    r.resize(w, h);
    const { r: fr, g, b, a } = hex(fill);
    r.fills = [{ type: 'SOLID', color: { r: fr, g, b }, opacity: a ?? 1 }];
    if (opts.stroke) {
      const { r: sr, g: sg, b: sb } = hex(opts.stroke);
      r.strokes = [{ type: 'SOLID', color: { r: sr, g: sg, b: sb } }];
      r.strokeWeight = opts.sw ?? 1;
      r.strokeAlign = 'INSIDE';
    }
    r.cornerRadius = opts.radius ?? 0;
    if (opts.x != null) r.x = opts.x;
    if (opts.y != null) r.y = opts.y;
    return r;
  }

  // ─── 1. HEADER ───────────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Header';
    f.resize(COL, 180);
    f.fills = solidPaint(C.surface2);

    // gold top line
    const topLine = makeRect(COL, 2, C.gold);
    topLine.x = 0; topLine.y = 0;
    f.appendChild(topLine);

    // eyebrow
    const eyebrow = makeText(
      'BIBLIOTHECA OBSCURA',
      'EB Garamond', 'Regular', 13.3, C.gold,
      { ls: 2.926, lh: 13.3, textCase: 'UPPER', x: PAD, y: 40 }
    );
    f.appendChild(eyebrow);
    eyebrow.x = (COL - eyebrow.width) / 2;

    // h1
    const h1 = makeText(
      'My Reading Journey',
      'Playfair Display', 'Bold', 44, C.cream,
      { ls: -0.88, lh: 48, x: PAD, y: 65 }
    );
    f.appendChild(h1);
    h1.x = (COL - h1.width) / 2;

    // subtitle
    const sub = makeText(
      'A curated catalogue of volumes read and contemplated',
      'EB Garamond', 'Regular', 17, C.muted,
      { lh: 27, x: PAD, y: 120 }
    );
    f.appendChild(sub);
    sub.x = (COL - sub.width) / 2;

    place(f);
  }

  // ─── 2. TAB BAR ──────────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Tab Bar';
    f.resize(COL, 54);
    f.fills = solidPaint(C.surface3);

    const tabs = ['I.  Library', 'II.  Add Book', 'III.  Read Next'];
    const tw = COL / 3;

    tabs.forEach((label, i) => {
      const active = i === 0;
      const bg = makeRect(tw, 54, active ? 'rgba(200,151,62,0.06)' : C.surface3);
      bg.x = i * tw;
      bg.y = 0;
      f.appendChild(bg);

      if (active) {
        const underline = makeRect(tw, 2, C.gold);
        underline.x = i * tw;
        underline.y = 52;
        f.appendChild(underline);
      }

      const t = makeText(label, 'EB Garamond', 'Regular', 15,
        active ? C.gold : C.muted,
        { ls: 1.5, textCase: 'UPPER' }
      );
      f.appendChild(t);
      t.x = i * tw + (tw - t.width) / 2;
      t.y = (54 - t.height) / 2;
    });

    place(f);
  }

  // ─── 3. STAT GRID ────────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Stat Grid';
    f.resize(COL, 88);
    f.fills = solidPaint(C.borderDim);

    const stats = [
      { num: '24', label: 'Books Read' },
      { num: '7,840', label: 'Pages Turned' },
      { num: '6', label: 'Genres Explored' },
    ];
    const sw = (COL - 2) / 3; // account for 1px gaps

    stats.forEach((s, i) => {
      const card = figma.createFrame();
      card.name = `Stat / ${s.label}`;
      card.resize(sw, 88);
      card.x = i * (sw + 1);
      card.y = 0;
      card.fills = solidPaint(C.surface2);

      // top accent
      const accent = makeRect(32, 2, C.goldDim);
      accent.x = (sw - 32) / 2; accent.y = 0;
      card.appendChild(accent);

      const num = makeText(s.num, 'Playfair Display', 'Bold', 36.8, C.cream, { ls: -0.736, lh: 36.8 });
      card.appendChild(num);
      num.x = (sw - num.width) / 2;
      num.y = 18;

      const lbl = makeText(s.label.toUpperCase(), 'EB Garamond', 'Regular', 11, C.muted, { ls: 1.54, textCase: 'UPPER' });
      card.appendChild(lbl);
      lbl.x = (sw - lbl.width) / 2;
      lbl.y = 62;

      f.appendChild(card);
    });

    place(f);
  }

  // ─── 4. BOOK CARD ────────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Book Card';
    f.resize(COL, 140);
    f.fills = solidPaint(C.surface2);
    const { r, g, b } = hex(C.border);
    f.strokes = [{ type: 'SOLID', color: { r, g, b } }];
    f.strokeWeight = 1;
    f.strokeAlign = 'INSIDE';
    f.cornerRadius = 2;

    // left gold accent stripe
    const stripe = makeRect(2, 140, C.goldDim);
    stripe.x = 0; stripe.y = 0;
    f.appendChild(stripe);

    // cover placeholder
    const cover = makeRect(72, 100, C.surface4, { radius: 1, stroke: C.borderMid });
    cover.x = 20; cover.y = 20;
    f.appendChild(cover);

    const coverLabel = makeText('Cover', 'EB Garamond', 'Regular', 11, C.muted, { ls: 1 });
    f.appendChild(coverLabel);
    coverLabel.x = 20 + (72 - coverLabel.width) / 2;
    coverLabel.y = 20 + 44;

    // text block
    const tx = 110;

    const title = makeText('Jonathan Strange & Mr Norrell', 'Playfair Display', 'Regular', 21, C.cream, { ls: 0, lh: 27 });
    f.appendChild(title);
    title.x = tx; title.y = 20;

    const author = makeText('Susanna Clarke', 'EB Garamond', 'Regular', 15.5, C.muted, { lh: 22 });
    f.appendChild(author);
    author.x = tx; author.y = 51;

    const meta = makeText('2004 · Fantasy · ★★★★★', 'EB Garamond', 'Regular', 13.3, C.muted, { lh: 20 });
    f.appendChild(meta);
    meta.x = tx; meta.y = 76;

    // badge
    const badge = makeRect(68, 22, 'rgba(200,151,62,0.10)', { radius: 1, stroke: C.goldDim, sw: 1 });
    badge.x = tx; badge.y = 104;
    f.appendChild(badge);
    const badgeTxt = makeText('FANTASY', 'EB Garamond', 'Regular', 10.5, C.gold, { ls: 1.26, textCase: 'UPPER' });
    f.appendChild(badgeTxt);
    badgeTxt.x = tx + (68 - badgeTxt.width) / 2;
    badgeTxt.y = 104 + (22 - badgeTxt.height) / 2;

    // menu dot
    const dot = makeText('⋯', 'EB Garamond', 'Regular', 18, C.muted);
    f.appendChild(dot);
    dot.x = COL - PAD - dot.width;
    dot.y = 20;

    place(f);
  }

  // ─── 5. RECOMMENDATION CARD ──────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Recommendation Card';
    f.resize(COL, 110);
    f.fills = solidPaint(C.surface2);
    const { r, g, b } = hex(C.border);
    f.strokes = [{ type: 'SOLID', color: { r, g, b } }];
    f.strokeWeight = 1; f.strokeAlign = 'INSIDE';
    f.cornerRadius = 2;

    // green left stripe
    const stripe = makeRect(2, 110, C.green);
    stripe.x = 0; stripe.y = 0;
    f.appendChild(stripe);

    const eyebrow = makeText('RECOMMENDED FOR YOU', 'EB Garamond', 'Regular', 11, C.green, { ls: 2, textCase: 'UPPER' });
    f.appendChild(eyebrow);
    eyebrow.x = 20; eyebrow.y = 16;

    const title = makeText('The Name of the Rose', 'Playfair Display', 'Regular', 20, C.cream, { lh: 26 });
    f.appendChild(title);
    title.x = 20; title.y = 38;

    const meta = makeText('Umberto Eco · 1980 · Historical Mystery', 'EB Garamond', 'Regular', 13.3, C.muted);
    f.appendChild(meta);
    meta.x = 20; meta.y = 68;

    const link = makeText('View on Goodreads →', 'EB Garamond', 'Regular', 13.3, C.gold, { ls: 0.266 });
    f.appendChild(link);
    link.x = COL - PAD - link.width;
    link.y = 68;

    place(f);
  }

  // ─── 6. BUTTONS ──────────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Buttons';
    f.resize(COL, 52);
    f.fills = solidPaint(C.surface2);

    const buttons = [
      { label: 'SAVE BOOK',   bg: C.goldDim,  fg: C.cream,  border: C.gold,   x: PAD },
      { label: 'CANCEL',      bg: C.surface3, fg: C.muted,  border: C.border, x: PAD + 160 },
      { label: 'DELETE',      bg: C.surface3, fg: C.red,    border: C.red,    x: PAD + 300 },
    ];

    for (const btn of buttons) {
      const bg = makeRect(140, 38, btn.bg, { stroke: btn.border, sw: 1, radius: 2 });
      bg.x = btn.x; bg.y = 7;
      f.appendChild(bg);

      const t = makeText(btn.label, 'EB Garamond', 'Regular', 13.3, btn.fg, { ls: 1.596, textCase: 'UPPER' });
      f.appendChild(t);
      t.x = btn.x + (140 - t.width) / 2;
      t.y = 7 + (38 - t.height) / 2;
    }

    place(f);
  }

  // ─── 7. GENRE BADGES ─────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Genre Badges';
    f.resize(COL, 36);
    f.fills = solidPaint(C.surface2);

    const badges = [
      { label: 'Fantasy',   bg: 'rgba(200,151,62,0.10)',  fg: C.gold,  border: C.goldDim },
      { label: 'Mystery',   bg: 'rgba(200,151,62,0.10)',  fg: C.gold,  border: C.goldDim },
      { label: 'Read Next', bg: 'rgba(58,102,73,0.14)',   fg: C.greenL,border: C.green },
    ];

    let bx = PAD;
    for (const b of badges) {
      const t = makeText(b.label, 'EB Garamond', 'Regular', 12, b.fg, { ls: 0.72, textCase: 'UPPER' });
      const bw = t.width + 20;
      const bg = makeRect(bw, 24, b.bg, { stroke: b.border, sw: 1, radius: 1 });
      bg.x = bx; bg.y = 6;
      f.appendChild(bg);
      t.x = bx + 10; t.y = 6 + (24 - t.height) / 2;
      f.appendChild(t);
      bx += bw + 10;
    }

    place(f);
  }

  // ─── 8. ADD BOOK FORM ────────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Component / Add Book Form';
    f.resize(COL, 360);
    f.fills = solidPaint(C.surface);

    const fields = [
      { label: 'Book Title',     y: 20  },
      { label: 'Author',         y: 90  },
      { label: 'Year Published', y: 160 },
      { label: 'Genre',          y: 230 },
    ];

    for (const field of fields) {
      const lbl = makeText(field.label.toUpperCase(), 'EB Garamond', 'Regular', 11, C.muted, { ls: 1.54, textCase: 'UPPER' });
      lbl.x = PAD; lbl.y = field.y;
      f.appendChild(lbl);

      const inp = makeRect(COL - PAD * 2, 38, C.surface2, { stroke: C.border, sw: 1, radius: 2 });
      inp.x = PAD; inp.y = field.y + 20;
      f.appendChild(inp);
    }

    // star rating row
    const ratingLbl = makeText('YOUR RATING', 'EB Garamond', 'Regular', 11, C.muted, { ls: 1.54, textCase: 'UPPER' });
    ratingLbl.x = PAD; ratingLbl.y = 300;
    f.appendChild(ratingLbl);

    const stars = makeText('★ ★ ★ ★ ★', 'EB Garamond', 'Regular', 22, C.gold);
    stars.x = PAD; stars.y = 322;
    f.appendChild(stars);

    place(f);
  }

  // ─── 9. COLOR SWATCH PAGE ────────────────────────────────────────────────────

  {
    const f = figma.createFrame();
    f.name = 'Color Swatches';
    f.resize(COL, 300);
    f.fills = solidPaint(C.surface);

    const title = makeText('Color Tokens', 'Playfair Display', 'Bold', 24, C.cream, { ls: 0 });
    title.x = PAD; title.y = 24;
    f.appendChild(title);

    const swatchSize = 48;
    const cols = 7;
    const allColors = COLORS.filter(c => !c.hex.startsWith('rgba'));

    allColors.forEach((col, i) => {
      const row = Math.floor(i / cols);
      const cx  = i % cols;
      const sx  = PAD + cx * (swatchSize + 10);
      const sy  = 70 + row * (swatchSize + 30);

      const swatch = makeRect(swatchSize, swatchSize, col.hex, { radius: 2, stroke: C.border, sw: 1 });
      swatch.x = sx; swatch.y = sy;
      f.appendChild(swatch);

      const shortName = col.name.split('/').pop();
      const lbl = makeText(shortName, 'EB Garamond', 'Regular', 9.5, C.muted, { ls: 0 });
      lbl.x = sx; lbl.y = sy + swatchSize + 4;
      f.appendChild(lbl);
    });

    place(f);
  }

  // ─── Done ─────────────────────────────────────────────────────────────────────

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  console.log('✅ Bibliotheca Obscura design system created on "Design System" page.');
  console.log('   • Color styles:', COLORS.length);
  console.log('   • Text styles:', TEXT_STYLES.length);
  console.log('   • Component frames: Header, Tab Bar, Stat Grid, Book Card,');
  console.log('     Recommendation Card, Buttons, Genre Badges, Add Book Form, Color Swatches');

})().catch(e => console.error('Import error:', e));
