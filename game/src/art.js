// art.js — one job: inked drawing primitives (2.5px #1C1917 outline, 3-layer
// shading: base + shadow + specular). No flat fillRect/arc-only game art.
import { INK, PAL } from './config.js';

export function outline(ctx, fn, lw = 2.5) {
  ctx.save();
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  fn();
  ctx.restore();
}
export function poly(ctx, pts, fill, shade = null, spec = null) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (shade) { ctx.fillStyle = shade; ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
  if (spec) { ctx.fillStyle = spec; ctx.fill(); }
}
export function ellipse(ctx, x, y, rx, ry, fill, shade) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (shade) { ctx.fillStyle = shade; ctx.beginPath(); ctx.ellipse(x + rx * 0.18, y + ry * 0.22, rx * 0.62, ry * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
}
export function panel(ctx, x, y, w, h, fill = PAL.cream, frame = INK) {
  // SOLID panels only (alpha >= 0.92) — cream solid + dark frame.
  ctx.save();
  ctx.globalAlpha = 0.97;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = frame; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.strokeStyle = PAL.brass; ctx.lineWidth = 1.5; ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);
  ctx.restore();
}
export function darkPanel(ctx, x, y, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.97; ctx.fillStyle = '#141B2C'; ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PAL.brass; ctx.lineWidth = 2.5; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.restore();
}
export function text(ctx, s, x, y, size, color, weight = 800, align = 'left', font = 'Georgia, serif', stroke = null) {
  // v2.1 Fix 1: a thick black outline over DARK text on a LIGHT (cream) panel
  // reads blurry / struck-through at 300px. Ink outlines belong ONLY on
  // text over dark backgrounds, i.e. only when the fill itself is light.
  // Dark fills (#7C2D12, #B45309, #1C1917) render clean bold with no stroke.
  // Pass stroke=true to force an outline (poster title), stroke=false to
  // force it off. Auto rule: outline iff fill luminance > 0.45.
  ctx.save();
  ctx.font = weight + ' ' + size + 'px ' + font;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  let lum = 0;
  const m = /^#([0-9a-f]{6})$/i.exec(String(color || ''));
  if (m) {
    const r = parseInt(m[1].slice(0, 2), 16), gg = parseInt(m[1].slice(2, 4), 16), b = parseInt(m[1].slice(4, 6), 16);
    lum = (0.299 * r + 0.587 * gg + 0.114 * b) / 255;
  }
  const useStroke = stroke !== null ? stroke : lum > 0.45;
  if (useStroke) {
    ctx.lineWidth = stroke === true ? Math.max(3.5, size / 7) : Math.max(2.5, size / 9);
    ctx.strokeStyle = 'rgba(12,10,8,0.85)';
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
  ctx.restore();
}
export function label(ctx, s, x, y, size, color, align = 'left') {
  ctx.save();
  ctx.font = '700 ' + size + 'px Verdana, sans-serif';
  ctx.textAlign = align; ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
}

// --- The winged expedition aircraft (chase view, banking) ---
// Drawn at cx,cy facing +X, scale s, bank angle, prop phase t.
export function drawAircraft(ctx, cx, cy, s, bank, t, opts = {}) {
  ctx.save();
  ctx.translate(cx, cy);
  // v2.1 Fix 2: bank is a real 25°–35° tilt in the poster/storm shots
  // (call sites pass bank in radians); gameplay passes small values.
  ctx.rotate(bank);
  ctx.scale(s, s);
  // contrails
  ctx.strokeStyle = 'rgba(234,246,251,0.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const dy of [-46, 46]) {
    ctx.beginPath(); ctx.moveTo(-150, dy); ctx.quadraticCurveTo(-260, dy + 8, -330, dy + 26); ctx.stroke();
  }
  // lower wing (shadow layer)
  poly(ctx, [[-30, 18], [10, 52], [70, 60], [30, 14]], '#8A5A1E', null);
  // upper wing — wide copper-bronze, 3-layer shading
  ctx.beginPath();
  ctx.moveTo(-58, -8); ctx.lineTo(30, -58); ctx.lineTo(118, -52); ctx.lineTo(96, -6); ctx.lineTo(-30, 4);
  ctx.closePath();
  ctx.fillStyle = '#D97706'; ctx.fill();
  ctx.fillStyle = 'rgba(120,53,15,0.55)'; ctx.fillRect(-58, -10, 176, 10);
  ctx.fillStyle = 'rgba(255,214,130,0.8)'; ctx.fillRect(-40, -52, 140, 7);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  // wing ribs
  ctx.strokeStyle = 'rgba(28,25,23,0.5)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 30, -46 + i * 2); ctx.lineTo(-34 + i * 30, -2); ctx.stroke(); }
  // twin tail booms + fins
  for (const dy of [-30, 30]) {
    poly(ctx, [[-120, dy - 7], [-58, dy - 5], [-58, dy + 5], [-120, dy + 7]], '#B45309', null);
    poly(ctx, [[-128, dy - 26], [-104, dy - 24], [-104, dy - 4], [-126, dy - 2]], '#C2410C', null);
  }
  // v2.1 Fix 3: installed Twin Tail Rudder glows on the airframe.
  if ((opts.mods || []).includes('twin-tail')) {
    ctx.save();
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 14;
    ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2;
    for (const dy of [-30, 30]) {
      ctx.beginPath();
      ctx.moveTo(-128, dy - 26); ctx.lineTo(-104, dy - 24); ctx.lineTo(-104, dy - 4); ctx.lineTo(-126, dy - 2);
      ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }
  // fuselage — brass, 3 layers
  ctx.beginPath();
  ctx.moveTo(-128, -14); ctx.quadraticCurveTo(-40, -26, 78, -14);
  ctx.quadraticCurveTo(128, -8, 138, 0); ctx.quadraticCurveTo(128, 8, 78, 14);
  ctx.quadraticCurveTo(-40, 26, -128, 14); ctx.closePath();
  ctx.fillStyle = '#C98A2E'; ctx.fill();
  ctx.fillStyle = 'rgba(120,53,15,0.5)'; ctx.fillRect(-128, 8, 266, 12);
  ctx.fillStyle = 'rgba(255,220,150,0.75)'; ctx.fillRect(-60, -22, 180, 7);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  // rivets
  ctx.fillStyle = 'rgba(28,25,23,0.6)';
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(-110 + i * 30, 4, 1.6, 0, Math.PI * 2); ctx.fill(); }
  // v2.1 Fix 3: installed Aux Fuel Bladder — extra tank slung under the hull.
  if ((opts.mods || []).includes('fuel-bladder')) {
    ctx.beginPath(); ctx.ellipse(-25, 38, 48, 14, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#C98A2E'; ctx.fill();
    ctx.fillStyle = 'rgba(120,53,15,0.45)';
    ctx.beginPath(); ctx.ellipse(-21, 42, 38, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.8)';
    ctx.beginPath(); ctx.ellipse(-31, 28, 34, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    for (const bx of [-53, -25, 3]) {
      ctx.fillStyle = '#3B2F2F'; ctx.fillRect(bx - 4, 25, 8, 26);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 4, 25, 8, 26);
    }
  }
  // v2.1 Fix 3: heater-engine exhaust flame (storm / wing-heat on).
  if (opts.storm) {
    ctx.save(); ctx.translate(-132, 0);
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 12;
    ctx.fillStyle = '#F97316';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(-18, 0, 0, 8); ctx.quadraticCurveTo(-6, 0, 0, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(-9, 0, 0, 4); ctx.quadraticCurveTo(-3, 0, 0, -4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // cockpit glass with crew silhouettes
  ctx.beginPath();
  ctx.moveTo(18, -20); ctx.quadraticCurveTo(52, -30, 82, -16); ctx.lineTo(78, -2); ctx.lineTo(22, -4);
  ctx.closePath();
  ctx.fillStyle = '#9FD8EF'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillRect(30, -24, 34, 6);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  // crew heads behind glass
  const heads = opts.crew || 2;
  for (let i = 0; i < heads; i++) {
    const hx = 34 + i * 20, hy = -10;
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#E8B98A' : '#D9A06B'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(hx, hy - 2, 7, Math.PI, 0); ctx.fillStyle = i === 0 ? '#3A2E22' : '#1C1917'; ctx.fill();
  }
  // v2.1 Fix 3: blue-white ice crystals clinging to wing edges & glass.
  if (opts.iced) {
    const crystals = [[-58, -8], [30, -58], [96, -6], [18, -20], [82, -16], [-30, 18], [70, 60], [-120, -20]];
    for (const [ccx, ccy] of crystals) {
      ctx.save(); ctx.translate(ccx, ccy);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3, r = k % 2 ? 3 : 7;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#DBEAFE'; ctx.fill();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
  }
  // v2.2 Fix 2 (climax): THICK blue-white rime ice clinging along the
  // leading edges of both wings, plus orange [H] HEAT glow melting the
  // wing roots — drawn on top of the small v2.1 crystals.
  if (opts.climax) {
    // thick ice slab along the upper-wing leading edge
    ctx.beginPath();
    ctx.moveTo(-62, -6); ctx.lineTo(28, -62); ctx.lineTo(122, -54); ctx.lineTo(118, -42);
    ctx.lineTo(30, -48); ctx.lineTo(-52, 4); ctx.closePath();
    ctx.fillStyle = '#DBEAFE'; ctx.fill();
    ctx.fillStyle = 'rgba(56,189,248,0.55)'; ctx.fillRect(-40, -52, 150, 6);
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.stroke();
    // jagged crystal teeth hanging off that leading edge
    ctx.fillStyle = '#EAF6FB';
    for (let k = 0; k < 7; k++) {
      const tx = -48 + k * 26, ty = -52 + k * 1.5;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 9, ty + 16); ctx.lineTo(tx + 18, ty); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // thick ice along the lower-wing leading edge
    ctx.beginPath();
    ctx.moveTo(-32, 16); ctx.lineTo(12, 54); ctx.lineTo(74, 62); ctx.lineTo(70, 50);
    ctx.lineTo(10, 42); ctx.lineTo(-24, 24); ctx.closePath();
    ctx.fillStyle = '#DBEAFE'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.stroke();
    // orange heat glow starting to melt the wing roots — v2.3: bigger
    // and brighter (heat vs ice contrast must read at 300px).
    ctx.save();
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(249,115,22,0.85)';
    ctx.beginPath(); ctx.ellipse(-18, -8, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-8, 16, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath(); ctx.ellipse(-18, -8, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
    // melt drips running off the wing root
    ctx.strokeStyle = 'rgba(56,189,248,0.9)'; ctx.lineWidth = 2;
    for (const [dx, dy] of [[-26, 2], [-12, 6], [2, 10], [-20, 10], [8, 14]]) {
      ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 2, dy + 12); ctx.stroke();
    }
    // v2.3: thick rime ice capping the cockpit glass — a jagged sheet
    // over the whole glass (semi-transparent so the crew still shows
    // through) with opaque crystal teeth along its top edge.
    ctx.beginPath();
    ctx.moveTo(14, -4); ctx.lineTo(20, -28); ctx.lineTo(34, -20); ctx.lineTo(44, -34);
    ctx.lineTo(56, -22); ctx.lineTo(68, -32); ctx.lineTo(78, -18); ctx.lineTo(88, -8);
    ctx.lineTo(80, 2); ctx.lineTo(22, 2); ctx.closePath();
    ctx.fillStyle = 'rgba(219,234,254,0.82)'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#EAF6FB';
    for (const [tx, ty] of [[24, -26], [44, -32], [64, -30], [80, -16]]) {
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 5, ty - 12); ctx.lineTo(tx + 10, ty); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    // v2.3: ice on the twin tail fin leading edges.
    for (const dy of [-30, 30]) {
      for (const [ix, iy] of [[-128, dy - 24], [-126, dy - 14], [-128, dy - 4]]) {
        ctx.save(); ctx.translate(ix, iy);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = k * Math.PI / 3, r = k % 2 ? 3 : 6;
          if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#DBEAFE'; ctx.fill();
        ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      }
    }
  }
  // nose propellers (2, spinning blur)
  const spin = t * 14;
  for (const px of [138]) {
    ctx.save(); ctx.translate(px, 0);
    for (let b = 0; b < 3; b++) {
      ctx.save(); ctx.rotate(spin + b * 2.094);
      ctx.beginPath(); ctx.ellipse(0, -20, 4.5, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,83,9,0.85)'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fillStyle = '#7C2D12'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  // v2.1 Fix 3: installed Anti-Ice Propellers spin with a heat glow.
  if ((opts.mods || []).includes('anti-ice-prop')) {
    ctx.save(); ctx.translate(138, 0);
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.stroke();
    ctx.restore();
  }
  // v2.2 Fix 2 (climax): thick rime ice clinging to the propeller disc —
  // crystal clusters at the blade tips, on top of the heated-prop glow.
  // v2.3: tighter cluster (radius ~28 local) so no crystal pokes into
  // the top bar at the +35% scale / 45° bank.
  if (opts.climax) {
    for (const [ix, iy] of [[138, -28], [156, -8], [156, 8], [138, 28], [112, 8], [112, -8]]) {
      ctx.save(); ctx.translate(ix, iy);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3, r = k % 2 ? 4 : 9;
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = '#DBEAFE'; ctx.fill();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
  }
  // wingtip lights
  ctx.beginPath(); ctx.arc(112, -52, 5, 0, Math.PI * 2); ctx.fillStyle = '#10B981'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// --- 3D chase-view aircraft (v2.4, Shot 3 only) ---
// Over-the-shoulder view from behind-above: big tail near the camera at
// the bottom, fuselage tapering (perspective) to a small nose far ahead
// at the top, pointed at the vanishing point. The fuselage axis stays
// fixed on the vanishing point; ONLY the wings / tailplane / fins roll
// with the bank angle, each rotating about its own centre — that is what
// a 63° bank looks like from behind. Pure canvas-2D perspective
// (taper + foreshortening + converging canyon); no WebGL/Three.js.
// Local frame: origin at plane centre, +x right, +y down, nose at -y.
// bank is in radians (negative = left wing diving).
export function drawChaseAircraft(ctx, cx, cy, bank, t, opts = {}) {
  const mods = opts.mods || [];
  ctx.save();
  ctx.translate(cx, cy);
  // v3.2 (Shot 3 only, dive25): scale 1.431 about the plane centre (cx,cy)
  // = v3.1's 1.06 x 1.35 (+35%). Uniform, so pose/position/rotation are
  // untouched; line widths and shadows scale with the aircraft.
  // Non-dive (live storm play) unscaled. The centre moved to (640,390)
  // in render.js and the bottom HUD was compacted (dialogue top y470 ->
  // y634), so the ~401px-tall bbox fits the 140..634 band with ~50px
  // clearance each side (measured from the render, not assumed).
  if (opts.dive25) ctx.scale(1.431, 1.431);
  // v2.5: DIAGONAL DIVING pose — the fuselage group rotates 135° so the
  // nose + copper props point forward-DOWN to the lower-right over dark
  // sky (never a vertical column stacked on the peaks); the wings keep
  // their own steep -55° tilt, so fuselage and wings cross at ~70° and
  // the plane reads as an unmistakable diving aircraft at 300px, not
  // one orange diagonal mass (the v2.4 failure: bank 63° put the wings
  // only 27° off the fuselage axis). BANK 63° stays on the HUD.
  const DIVE = opts.dive25 ? Math.PI * 0.75 : 0; // 135° clockwise
  const WBANK = opts.dive25 ? -0.96 : bank; // wings: -55° on screen
  // ---- fuselage (dive-rotated in v2.5): tapered brass body, wide tail
  // -> narrow nose. v2.4 pass 2: FORESHORTENED (tail +92, nose -62).
  ctx.save(); ctx.rotate(DIVE);
  ctx.beginPath();
  ctx.moveTo(-30, 92); ctx.lineTo(-18, 44); ctx.lineTo(-10, -20); ctx.lineTo(-6, -62);
  ctx.lineTo(6, -62); ctx.lineTo(10, -20); ctx.lineTo(18, 44); ctx.lineTo(30, 92);
  ctx.closePath();
  ctx.fillStyle = '#C98A2E'; ctx.fill();
  // top highlight strip (sun on the spine)
  ctx.beginPath();
  ctx.moveTo(-5, -58); ctx.lineTo(5, -58); ctx.lineTo(9, 40); ctx.lineTo(-9, 40);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,220,150,0.55)'; ctx.fill();
  // belly shade
  ctx.beginPath();
  ctx.moveTo(-28, 88); ctx.lineTo(28, 88); ctx.lineTo(16, 44); ctx.lineTo(-16, 44);
  ctx.closePath();
  ctx.fillStyle = 'rgba(120,53,15,0.45)'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-30, 92); ctx.lineTo(-18, 44); ctx.lineTo(-10, -20); ctx.lineTo(-6, -62);
  ctx.lineTo(6, -62); ctx.lineTo(10, -20); ctx.lineTo(18, 44); ctx.lineTo(30, 92);
  ctx.closePath(); ctx.stroke();
  // v3.1 (dive25 only): GOLD RIM-LIGHT on the fuselage edge facing the
  // bolt (local -x = screen up-right after the 135° dive) — the
  // lightning catch that separates the brass body from the dark sky.
  if (opts.dive25) {
    ctx.save();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, -62); ctx.lineTo(-10, -20); ctx.lineTo(-18, 44); ctx.lineTo(-30, 92);
    ctx.stroke();
    ctx.restore();
  }
  // panel lines across the fuselage
  ctx.strokeStyle = 'rgba(28,25,23,0.45)'; ctx.lineWidth = 1.5;
  for (const py of [-16, 12, 40]) {
    ctx.beginPath(); ctx.moveTo(-13, py); ctx.quadraticCurveTo(0, py + 4, 13, py); ctx.stroke();
  }
  // rivets down the spine
  ctx.fillStyle = 'rgba(28,25,23,0.6)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-14 + (i % 2) * 28, -46 + i * 22, 1.5, 0, Math.PI * 2); ctx.fill(); }
  // twin tail booms flanking the tail (fore-aft rails, seen from behind)
  for (const bx of [-24, 24]) {
    ctx.beginPath();
    ctx.moveTo(bx - 6, 28); ctx.lineTo(bx + 6, 28); ctx.lineTo(bx + 8, 92); ctx.lineTo(bx - 8, 92);
    ctx.closePath();
    ctx.fillStyle = '#B45309'; ctx.fill();
    ctx.fillStyle = 'rgba(255,214,130,0.6)'; ctx.fillRect(bx - 5, 30, 3, 58);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  }
  // aux fuel bladder slung under the tail (installed refit, peeking below)
  if (mods.includes('fuel-bladder')) {
    ctx.beginPath(); ctx.ellipse(0, 100, 26, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#C98A2E'; ctx.fill();
    ctx.fillStyle = 'rgba(120,53,15,0.45)';
    ctx.beginPath(); ctx.ellipse(3, 103, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.8)';
    ctx.beginPath(); ctx.ellipse(-4, 95, 18, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#3B2F2F'; ctx.fillRect(-14, 92, 6, 16); ctx.fillRect(8, 92, 6, 16);
  }
  // heater exhaust flame at the tail (storm / heat on) — small, at viewer
  if (opts.storm) {
    if (opts.dive25) {
      // v3.1 (dive25 only): AFTERBURNER — a big 3-layer orange-red flame
      // cone streaming back from the tail (local +y = tail direction,
      // up-left on screen after the 135° dive, away from the plane and
      // clear of the [H] chip, bolt and rings). Screen tip ~(528,186),
      // well inside the y150–y460 free band — no clearance impact.
      ctx.save(); ctx.translate(0, 92);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const abGlow = ctx.createRadialGradient(0, 26, 2, 0, 26, 34);
      abGlow.addColorStop(0, 'rgba(249,115,22,0.45)');
      abGlow.addColorStop(1, 'rgba(249,115,22,0)');
      ctx.fillStyle = abGlow;
      ctx.beginPath(); ctx.arc(0, 26, 34, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.shadowColor = '#F97316'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#EA580C';
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-13, 30, 0, 58); ctx.quadraticCurveTo(13, 30, 10, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#F97316';
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-8, 20, 0, 40); ctx.quadraticCurveTo(8, 20, 7, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.quadraticCurveTo(-4, 12, 0, 24); ctx.quadraticCurveTo(4, 12, 4, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(0, 96);
      ctx.shadowColor = '#F97316'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#F97316';
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(0, 14, 6, 0); ctx.quadraticCurveTo(0, 5, -6, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(0, 7, 3, 0); ctx.quadraticCurveTo(0, 3, -3, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore(); // end dive-rotated fuselage group (v2.5; no-op when DIVE 0)
  // ---- wings (rolled with the bank about the wing root, local (0, 5))
  ctx.save();
  ctx.translate(0, 5); ctx.rotate(WBANK);
  const wing = (sign) => {
    // v2.4 pass 3: LIGHTER copper than the brass fuselage + thicker chord
    // (46 root -> 24 tip) + a dark root seam — at 63° bank the rising
    // wing sits only 27° off the fuselage axis, so pass 2's same-colour
    // thin wing merged into one orange column with the body.
    ctx.beginPath();
    ctx.moveTo(sign * 10, -23); ctx.lineTo(sign * 150, -30); ctx.lineTo(sign * 165, -12);
    ctx.lineTo(sign * 150, 16); ctx.lineTo(sign * 14, 23);
    ctx.closePath();
    // v2.5: brighter copper-gold so the wings pop off the darker night sky.
    ctx.fillStyle = opts.dive25 ? '#F2A93B' : '#E8912A'; ctx.fill();
    ctx.fillStyle = 'rgba(120,53,15,0.55)'; ctx.fillRect(sign > 0 ? 12 : -150, 10, 138, 10);
    ctx.fillStyle = opts.dive25 ? 'rgba(255,232,175,0.95)' : 'rgba(255,224,160,0.9)'; ctx.fillRect(sign > 0 ? 12 : -148, -28, 136, 7);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    // v3.1 (dive25 only): GOLD RIM-LIGHT on the rising right wing's
    // leading edge + tip — the edge facing the near-miss bolt, so the
    // copper wing keeps its edge against the white-cyan flash.
    if (opts.dive25 && sign > 0) {
      ctx.save();
      ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(12, -23); ctx.lineTo(150, -30); ctx.lineTo(165, -12); ctx.lineTo(150, 16);
      ctx.stroke();
      ctx.restore();
    }
    // wing ribs
    ctx.strokeStyle = 'rgba(28,25,23,0.5)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      const rx = sign * (40 + i * 30);
      ctx.beginPath(); ctx.moveTo(rx, -26); ctx.lineTo(rx + sign * 4, 19); ctx.stroke();
    }
    // dark root seam where the wing meets the fuselage
    ctx.strokeStyle = 'rgba(28,25,23,0.75)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sign * 12, -22); ctx.lineTo(sign * 16, 22); ctx.stroke();
  };
  wing(1); // right wing (rises with the left bank) — bare copper + tip ice
  wing(-1); // left wing (diving) — copper base, iced over below
  // v2.4: THICK layered crystal ice covering ~70% of the diving left wing,
  // from the tip in to just short of the root; the root stays copper-hot.
  // (Slab follows the pass-3 thicker wing: top edge -14 at the tip
  // sloping to -28 at the root, with a slight overhang at the tip.)
  // v2.5: 75% coverage — the slab now reaches in to -44 (three-quarters
  // of the span from the tip), brighter near-white, with bigger jagged
  // teeth and chunky crystal blocks for a heavy iced look.
  const iceRoot = opts.dive25 ? -44 : -52;
  ctx.beginPath();
  ctx.moveTo(-165, -14); ctx.lineTo(iceRoot, -28); ctx.lineTo(iceRoot, 24); ctx.lineTo(-165, 18);
  ctx.closePath();
  ctx.fillStyle = opts.dive25 ? '#EDF5FF' : '#DBEAFE'; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-165, -14); ctx.lineTo(-118, -20); ctx.lineTo(-118, 20); ctx.lineTo(-165, 18);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill();
  ctx.strokeStyle = opts.dive25 ? '#7DD3FC' : '#38BDF8'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-165, -14); ctx.lineTo(iceRoot, -28); ctx.lineTo(iceRoot, 24); ctx.lineTo(-165, 18);
  ctx.closePath(); ctx.stroke();
  // v2.6 (dive25 only): bright cyan-white rim light on the slab's outer
  // edges (tip + lower edge facing the threat peaks) — the slab must
  // read as a separate bright mass from the blue-grey peak below it
  // at 300px. The v2.4 fallback keeps its plain outline.
  if (opts.dive25) {
    ctx.save();
    ctx.shadowColor = '#67E8F9'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#E0F2FE'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-165, -14); ctx.lineTo(-165, 18); ctx.lineTo(iceRoot, 24);
    ctx.stroke();
    ctx.restore();
  }
  // jagged crystal teeth along the iced leading edge
  ctx.fillStyle = '#F4FAFF';
  for (let k = 0; k < 6; k++) {
    const tx = -158 + k * 17, by = -16 - k * 2.2;
    ctx.beginPath(); ctx.moveTo(tx, by); ctx.lineTo(tx + 6, by - (opts.dive25 ? 20 : 14)); ctx.lineTo(tx + 12, by); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = opts.dive25 ? '#7DD3FC' : '#38BDF8'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  // v2.5: chunky crystal blocks jutting off the slab — heavy ice, not a
  // flat sheet. (Left wing only; the right wing stays bare copper.)
  if (opts.dive25) {
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#7DD3FC'; ctx.lineWidth = 1.5;
    for (const [bx, by, bw, bh] of [[-152, -30, 26, 18], [-112, -34, 30, 20], [-72, -32, 26, 18]]) {
      ctx.beginPath();
      ctx.moveTo(bx, by + bh); ctx.lineTo(bx + bw * 0.3, by); ctx.lineTo(bx + bw * 0.62, by + bh * 0.45);
      ctx.lineTo(bx + bw, by + bh * 0.2); ctx.lineTo(bx + bw, by + bh); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  }
  // crystal stars scattered on the ice slab
  for (const [ccx, ccy] of [[-140, -8], [-110, 4], [-86, -10], [-132, 8], [-66, 6]]) {
    ctx.save(); ctx.translate(ccx, ccy);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, r = k % 2 ? 3 : 7;
      if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#DBEAFE'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  // orange [H] HEAT glow melting both wing roots (heat vs ice contrast).
  // Outboard of the canopy (canopy spans ~±21 here) so the glow stays visible.
  for (const gx of [-26, 26]) {
    ctx.save();
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(249,115,22,0.85)';
    ctx.beginPath(); ctx.ellipse(gx, 4, 16, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath(); ctx.ellipse(gx, 4, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  // melt drips running off the left root (outboard of the canopy)
  ctx.strokeStyle = 'rgba(56,189,248,0.9)'; ctx.lineWidth = 2;
  for (const [dx, dy] of [[-34, 8], [-22, 12], [-40, 12]]) {
    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 2, dy + 10); ctx.stroke();
  }
  // ice shards flying off the diving left wing (leading-edge side, so
  // they stay above the dialogue box at full frame)
  ctx.fillStyle = '#EAF6FB';
  for (const [sx, sy, sr] of [[-172, -16, 5], [-160, -24, 4], [-144, -28, 5], [-128, -22, 4]]) {
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(sr);
    ctx.beginPath(); ctx.moveTo(-sr, 0); ctx.lineTo(sr, -sr); ctx.lineTo(sr, sr); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  // wingtip lights: bright green + white strobe on the rising right tip
  // (the lightning near-miss target), left tip glinting through its ice
  ctx.beginPath(); ctx.arc(158, -6, 5, 0, Math.PI * 2); ctx.fillStyle = '#10B981'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(162, -10, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.beginPath(); ctx.arc(-158, -6, 4, 0, Math.PI * 2); ctx.fillStyle = '#A7F3D0'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // ---- tailplane + vertical fins (rolled with the bank about the tail centre)
  ctx.save();
  // v2.5: the tailplane rides with the diving fuselage — its centre is
  // the fuselage tail point rotated 135°: R(135°)·(0,80) = (-56.6,-56.6).
  if (opts.dive25) { ctx.translate(-56.6, -56.6); ctx.rotate(DIVE); }
  else { ctx.translate(0, 80); ctx.rotate(bank); }
  for (const sign of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(sign * 8, -6); ctx.lineTo(sign * 50, -9); ctx.lineTo(sign * 54, 0); ctx.lineTo(sign * 48, 7); ctx.lineTo(sign * 8, 6);
    ctx.closePath();
    ctx.fillStyle = '#C2410C'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  }
  for (const bx of [-24, 24]) {
    // vertical fin, swept, at the end of each boom
    ctx.beginPath();
    ctx.moveTo(bx - 7, 6); ctx.lineTo(bx + 2, -30); ctx.lineTo(bx + 12, -28); ctx.lineTo(bx + 9, 6);
    ctx.closePath();
    ctx.fillStyle = '#C2410C'; ctx.fill();
    ctx.fillStyle = 'rgba(255,214,130,0.7)'; ctx.fillRect(bx + 1, -28, 4, 32);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    if (mods.includes('twin-tail')) {
      ctx.save();
      ctx.shadowColor = '#F97316'; ctx.shadowBlur = 12;
      ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 7, 6); ctx.lineTo(bx + 2, -30); ctx.lineTo(bx + 12, -28); ctx.lineTo(bx + 9, 6); ctx.closePath(); ctx.stroke();
      ctx.restore();
    }
    // ice on the fin leading edges
    ctx.save(); ctx.translate(bx + 2, -28);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, r = k % 2 ? 3 : 6;
      if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#DBEAFE'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // ---- canopy (on top of the wings): wide brass-framed glass hump.
  // v2.4 pass 2: WIDE + SHORT with TWO crew side by side (pilot +
  // co-pilot) — the pass-1 tandem row of heads read as ladder rungs.
  // v2.5: the canopy rides with the diving fuselage (rotate DIVE).
  ctx.save(); ctx.rotate(DIVE);
  ctx.beginPath();
  ctx.moveTo(-20, 34); ctx.quadraticCurveTo(-24, -22, 0, -30); ctx.quadraticCurveTo(24, -22, 20, 34);
  ctx.closePath();
  ctx.fillStyle = '#9FD8EF'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillRect(-12, -22, 7, 44);
  ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, 34); ctx.quadraticCurveTo(-24, -22, 0, -30); ctx.quadraticCurveTo(24, -22, 20, 34);
  ctx.stroke();
  // v3.1 (dive25 only): GOLD RIM-LIGHT on the canopy edge facing the
  // bolt (local -x = screen up-right after the 135° dive).
  if (opts.dive25) {
    ctx.save();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-20, 34); ctx.quadraticCurveTo(-24, -22, 0, -30);
    ctx.stroke();
    ctx.restore();
  }
  // crew heads side by side behind the glass — dark leather flying
  // helmets seen from behind (pass 3: skin-tone faces with hair caps
  // read as two cartoon eyes at this size).
  const heads = Math.min(opts.crew || 3, 2);
  for (let i = 0; i < heads; i++) {
    const hx = i === 0 ? -9 : 9, hy = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#3A2E22'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
    // brass goggle strap across the helmet
    ctx.strokeStyle = '#B45309'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx - 7, hy - 1); ctx.lineTo(hx + 7, hy - 1); ctx.stroke();
    // chin / neck sliver below the helmet
    ctx.fillStyle = i === 0 ? '#E8B98A' : '#D9A06B';
    ctx.beginPath(); ctx.arc(hx, hy + 6, 3.5, 0, Math.PI); ctx.fill();
  }
  ctx.restore(); // end dive-rotated canopy group (v2.5)
  // ---- nose propeller (far ahead, small): spinning blur disc + ice at rim
  // v2.5: rotate with the diving fuselage so the prop sits at the nose
  // pointing forward-down to the lower-right.
  ctx.save(); if (opts.dive25) ctx.rotate(DIVE); ctx.translate(0, -62);
  // spinner cone
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(0, -12); ctx.lineTo(5, 0); ctx.closePath();
  ctx.fillStyle = '#B45309'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  // v2.6 (dive25 only): bright copper-gold glint on the spinner cone —
  // the nose must not read as a small dark blob against the night sky.
  if (opts.dive25) {
    ctx.save();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 6;
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath(); ctx.moveTo(-1.5, -1); ctx.lineTo(0, -11); ctx.lineTo(1.5, -1); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  const spin = t * 14;
  for (let b = 0; b < 3; b++) {
    ctx.save(); ctx.rotate(spin + b * 2.094);
    ctx.beginPath(); ctx.ellipse(0, -15, 4.5, 15, 0, 0, Math.PI * 2);
    // v2.6 (dive25 only): bright copper-gold blades + gold spoke — the
    // prop must read as crossing blades over dark sky, not a dark blob.
    ctx.fillStyle = opts.dive25 ? '#FBBF24' : 'rgba(180,83,9,0.8)'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke();
    if (opts.dive25) {
      ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -14); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = '#7C2D12'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  // v2.6 (dive25 only): bright hub dot — the prop centre glints.
  if (opts.dive25) {
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  // v3.1 (dive25 only): GOLD RIM-LIGHT arc on the prop-disc edge facing
  // the bolt (local -x = screen up-right after the 135° dive).
  if (opts.dive25) {
    ctx.save();
    ctx.shadowColor = '#FBBF24'; ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 30, Math.PI * 0.72, Math.PI * 1.28); ctx.stroke();
    ctx.restore();
  }
  // heated-prop glow ring (installed anti-ice prop)
  if (mods.includes('anti-ice-prop')) {
    ctx.save();
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 11, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.stroke();
    ctx.restore();
  }
  // rime ice clinging to the spinning prop rim
  for (const [ix, iy] of [[-30, 0], [30, 0], [-22, -9], [22, -9], [-22, 9], [22, 9]]) {
    ctx.save(); ctx.translate(ix, iy);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3, r = k % 2 ? 3 : 6;
      if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#DBEAFE'; ctx.fill();
    ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}

// --- Aurora curtain ---
// boost > 1 thickens / brightens the curtain (v2.1 poster + storm shots).
export function drawAurora(ctx, t, seedPh = 0, boost = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const baseY = 60 + i * 46;
    ctx.beginPath();
    ctx.moveTo(0, baseY + 90 + (boost - 1) * 30);
    for (let x = 0; x <= 1280; x += 40) {
      const y = baseY + Math.sin(x * 0.006 + t * 0.5 + i * 1.7 + seedPh) * 26 + Math.sin(x * 0.013 - t * 0.3) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1280, baseY + 90 + (boost - 1) * 30); ctx.closePath();
    const g = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 90 + (boost - 1) * 30);
    const col = i === 1 ? '217,70,239' : '16,185,129';
    g.addColorStop(0, 'rgba(' + col + ',' + Math.min(0.85, 0.55 * boost).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.restore();
}

// --- Ice peaks (far below) ---
export function drawPeaks(ctx, peaks, camX) {
  for (const p of peaks) {
    const x = ((p.x - camX * 0.35) % 5200 + 5200) % 5200 - 400;
    const base = p.y;
    ctx.beginPath();
    ctx.moveTo(x - p.w / 2, base);
    ctx.lineTo(x - p.w * 0.18, base - p.h);
    ctx.lineTo(x + p.w * 0.1, base - p.h * 0.72);
    ctx.lineTo(x + p.w * 0.32, base - p.h * 0.9);
    ctx.lineTo(x + p.w / 2, base);
    ctx.closePath();
    ctx.fillStyle = p.shade > 0.5 ? '#7FA8C4' : '#5B7FA0'; ctx.fill();
    ctx.fillStyle = 'rgba(234,246,251,0.9)';
    ctx.beginPath();
    ctx.moveTo(x - p.w * 0.18, base - p.h);
    ctx.lineTo(x + p.w * 0.02, base - p.h * 0.62);
    ctx.lineTo(x - p.w * 0.05, base - p.h * 0.55);
    ctx.lineTo(x - p.w * 0.1, base - p.h * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  }
}

// --- Crew portrait (inked face + outfit variant) ---
export function drawCrew(ctx, c, x, y, r) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#2A2F3A'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.fillStyle = c.accent; ctx.globalAlpha = 0.35; ctx.fillRect(x - r, y + r * 0.4, r * 2, r * 0.6); ctx.globalAlpha = 1;
  // shoulders / outfit
  ctx.beginPath(); ctx.moveTo(x - r * 0.9, y + r); ctx.quadraticCurveTo(x, y + r * 0.1, x + r * 0.9, y + r); ctx.closePath();
  ctx.fillStyle = '#3B2F2F'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(x, y - r * 0.18, r * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = c.skin; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  // hair
  ctx.beginPath(); ctx.arc(x, y - r * 0.32, r * 0.52, Math.PI, 0);
  ctx.fillStyle = c.hair; ctx.fill();
  // eyes + smile
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.16, r * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.2, y - r * 0.16, r * 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y + r * 0.05, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = PAL.brass; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
}

// --- v2.1 Fix 3: large mechanical illustrations for the 3 refit cards ---
// Each is drawn fresh with the 2.5px ink outline + 3-layer shading
// (base + shadow + specular) used across the game. id selects the part.
export function drawRefitArt(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (id === 'twin-tail') {
    // (1) Copper Twin Tail Fins — two fins on a tail boom, side view.
    poly(ctx, [[-70, 14], [70, 14], [70, 26], [-70, 26]], '#8A5A1E', null);
    for (const fx of [-52, 34]) {
      ctx.beginPath();
      ctx.moveTo(fx - 16, 14); ctx.lineTo(fx + 6, -52); ctx.lineTo(fx + 30, -48); ctx.lineTo(fx + 26, 14);
      ctx.closePath();
      ctx.fillStyle = '#C2410C'; ctx.fill();
      ctx.fillStyle = 'rgba(120,53,15,0.55)'; ctx.fillRect(fx - 16, -6, 44, 20);
      ctx.fillStyle = 'rgba(255,214,130,0.85)'; ctx.fillRect(fx + 2, -48, 8, 58);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();
      // fin ribs
      ctx.strokeStyle = 'rgba(28,25,23,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(fx - 8, -30); ctx.lineTo(fx + 14, -30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fx - 12, -12); ctx.lineTo(fx + 20, -12); ctx.stroke();
    }
    // rudder hinges + bolts
    ctx.fillStyle = '#1C1917';
    for (const bx of [-58, -30, 28, 56]) { ctx.beginPath(); ctx.arc(bx, 20, 2.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'anti-ice-prop') {
    // (2) Glowing Orange Heated Propeller — 3 blades, heat glow, hub.
    ctx.save();
    ctx.shadowColor = '#F97316'; ctx.shadowBlur = 22;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(249,115,22,0.35)'; ctx.fill();
    ctx.restore();
    for (let b = 0; b < 3; b++) {
      ctx.save(); ctx.rotate(b * 2.094);
      ctx.beginPath(); ctx.ellipse(0, -34, 10, 32, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#EA580C'; ctx.fill();
      ctx.fillStyle = 'rgba(124,45,18,0.5)';
      ctx.beginPath(); ctx.ellipse(3, -30, 6, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,214,130,0.9)';
      ctx.beginPath(); ctx.ellipse(-3, -44, 4, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
    }
    // heat ring + hub
    ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.strokeStyle = '#FDBA74'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#7C2D12'; ctx.fill();
    ctx.fillStyle = 'rgba(255,214,130,0.8)'; ctx.beginPath(); ctx.arc(-4, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
  } else {
    // (3) Belted Brass Fuel Tank — horizontal brass tank, 3 straps, cap.
    ctx.beginPath();
    ctx.ellipse(0, 0, 72, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#C98A2E'; ctx.fill();
    ctx.fillStyle = 'rgba(120,53,15,0.45)';
    ctx.beginPath(); ctx.ellipse(6, 12, 58, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,150,0.8)';
    ctx.beginPath(); ctx.ellipse(-8, -14, 52, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    // 3 belts
    for (const bx of [-38, 0, 38]) {
      ctx.fillStyle = '#3B2F2F'; ctx.fillRect(bx - 6, -33, 12, 66);
      ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(bx - 6, -33, 12, 66);
      ctx.fillStyle = '#D97706'; ctx.fillRect(bx - 6, -6, 12, 12);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 6, -6, 12, 12);
    }
    // filler cap + gauge
    ctx.beginPath(); ctx.arc(52, -26, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#7C2D12'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(-52, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#F5EFE6'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#E5484D'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(-47, -5); ctx.stroke();
  }
  ctx.restore();
}
