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
  // wingtip lights
  ctx.beginPath(); ctx.arc(112, -52, 5, 0, Math.PI * 2); ctx.fillStyle = '#10B981'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
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
