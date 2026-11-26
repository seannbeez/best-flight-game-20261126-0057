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
export function text(ctx, s, x, y, size, color, weight = 800, align = 'left', font = 'Georgia, serif') {
  ctx.save();
  ctx.font = weight + ' ' + size + 'px ' + font;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.lineWidth = Math.max(3, size / 7); ctx.strokeStyle = 'rgba(12,10,8,0.85)';
  ctx.strokeText(s, x, y);
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
  ctx.rotate(bank * 0.35);
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
  // wingtip lights
  ctx.beginPath(); ctx.arc(112, -52, 5, 0, Math.PI * 2); ctx.fillStyle = '#10B981'; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// --- Aurora curtain ---
export function drawAurora(ctx, t, seedPh = 0) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const baseY = 60 + i * 46;
    ctx.beginPath();
    ctx.moveTo(0, baseY + 90);
    for (let x = 0; x <= 1280; x += 40) {
      const y = baseY + Math.sin(x * 0.006 + t * 0.5 + i * 1.7 + seedPh) * 26 + Math.sin(x * 0.013 - t * 0.3) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1280, baseY + 90); ctx.closePath();
    const g = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 90);
    const col = i === 1 ? '217,70,239' : '16,185,129';
    g.addColorStop(0, 'rgba(' + col + ',0.55)');
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
