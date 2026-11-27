// hud.js — one job: HUD panels (top bar, side panels, bottom instruments, matrix).
import { PAL, SECTORS, CREW, MODULES, PHENOMENA, FEATS, EVENTS, ALTITUDES, MODES, SET_BONUS } from './config.js';
import { panel, darkPanel, text, label, drawCrew } from './art.js';
import { setBonus } from './flight.js';

export function topBar(ctx, g) {
  darkPanel(ctx, 0, 0, 1280, 56);
  const sec = SECTORS[g.sector - 1];
  text(ctx, 'STRATOSPHERE OBSERVATORY', 16, 36, 21, PAL.brass);
  label(ctx, 'SECTOR ' + g.sector + '/6 · ' + sec.name + ' · ' + g.mode.toUpperCase(), 400, 34, 15, PAL.ice);
  label(ctx, 'SCORE ' + g.score.toLocaleString(), 900, 34, 17, '#F5EFE6');
  label(ctx, 'RANK ' + g.rank, 1150, 34, 17, PAL.gold);
  // ALT / SPD / HDG numerals — Criterion 1
  label(ctx, 'ALT ' + Math.round(ALTITUDES[g.altitude].ft.replace(/,/g, '').replace(' FT', '')) + ' FT', 16, 78, 15, '#F5EFE6');
  label(ctx, 'SPD ' + Math.round(g.speed) + ' KT', 190, 78, 15, '#F5EFE6');
  label(ctx, 'HDG ' + String(Math.round(((g.heading * 57.2958) % 360 + 360) % 360)).padStart(3, '0') + '°', 360, 78, 15, '#F5EFE6');
  label(ctx, 'THR ' + Math.round(g.throttle * 100) + '%', 500, 78, 15, PAL.brass);
}

export function leftPanel(ctx, g) {
  panel(ctx, 12, 92, 218, 280, PAL.cream);
  text(ctx, 'CREW · 6', 26, 122, 16, '#7C2D12');
  CREW.forEach((c, i) => {
    const y = 142 + i * 38;
    drawCrew(ctx, c, 48, y, 15);
    label(ctx, c.name.split(' ')[1] || c.name, 70, y - 2, 12, '#1C1917');
    label(ctx, c.role.toUpperCase(), 70, y + 13, 10, '#7C2D12');
  });
  panel(ctx, 12, 384, 218, 108, PAL.cream);
  text(ctx, 'MODULES ' + g.modules.length + '/18', 26, 414, 16, '#7C2D12');
  if (g.modules.length === 0) label(ctx, 'No modules yet —', 26, 438, 12, '#44403C');
  if (g.modules.length === 0) label(ctx, 'clear a sector to draft.', 26, 456, 12, '#44403C');
  g.modules.slice(0, 3).forEach((m, i) => label(ctx, '▸ ' + m.name, 26, 438 + i * 18, 11, '#1C1917'));
}

export function rightPanel(ctx, g) {
  panel(ctx, 1050, 92, 218, 300, PAL.cream);
  text(ctx, 'SECTORS · 6', 1064, 122, 16, '#7C2D12');
  SECTORS.forEach((s, i) => {
    const y = 144 + i * 26;
    const done = i + 1 < g.sector, cur = i + 1 === g.sector;
    label(ctx, (done ? '✓ ' : cur ? '➤ ' : '○ ') + s.id + ' ' + s.name, 1064, y, 12, cur ? '#B45309' : '#1C1917');
  });
  text(ctx, 'PHENOMENA · 14', 1064, 322, 16, '#7C2D12');
  const ph = PHENOMENA[g.phenActive];
  label(ctx, 'NOW: ' + ph.name, 1064, 344, 12, '#B45309');
  label(ctx, ph.fx, 1064, 362, 11, '#44403C');
  label(ctx, 'FEATS ' + g.feats.length + '/20 · SAMPLES ' + g.samples, 1064, 384, 11, '#44403C');
}

export function bottomInstruments(ctx, g) {
  // 4 instrument close-ups along the bottom edge — v2.1: real dials with
  // tick marks, needles and zone colouring, not flat bars.
  const y = 596, h = 112;
  // Fuel manometer — bar + 10% ticks + needle marker at the level.
  panel(ctx, 12, y, 300, h, PAL.cream);
  text(ctx, 'FUEL MANOMETER', 26, y + 26, 14, '#7C2D12');
  ctx.fillStyle = '#2A2F3A'; ctx.fillRect(26, y + 44, 260, 18);
  ctx.fillStyle = g.fuel > 25 ? '#10B981' : '#E5484D';
  ctx.fillRect(26, y + 44, 260 * (g.fuel / g.fuelMax), 18);
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.strokeRect(26, y + 44, 260, 18);
  for (let i = 0; i <= 10; i++) {
    const tx = 26 + i * 26;
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = i % 5 === 0 ? 2.5 : 1.5;
    ctx.beginPath(); ctx.moveTo(tx, y + 40); ctx.lineTo(tx, y + 66); ctx.stroke();
  }
  const fx = 26 + 260 * (g.fuel / g.fuelMax);
  ctx.fillStyle = '#1C1917';
  ctx.beginPath(); ctx.moveTo(fx - 6, y + 38); ctx.lineTo(fx + 6, y + 38); ctx.lineTo(fx, y + 46); ctx.closePath(); ctx.fill();
  label(ctx, 'E', 26, y + 80, 10, '#44403C');
  label(ctx, 'F', 278, y + 80, 10, '#44403C');
  // v2.4 (climax): red CRITICAL fuel warning — 8 / 100 GAL. The track
  // itself tints dark red ("merah penuh") while the bright-red level
  // sliver still shows the true 8% level.
  if (g.climax) {
    ctx.save(); ctx.shadowColor = '#E5484D'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#7F1D1D'; ctx.fillRect(26, y + 44, 260, 18);
    ctx.fillStyle = '#E5484D'; ctx.fillRect(26, y + 44, 260 * (g.fuel / g.fuelMax), 18);
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.strokeRect(26, y + 44, 260, 18);
    ctx.strokeStyle = '#E5484D'; ctx.lineWidth = 2.5; ctx.strokeRect(26, y + 44, 260, 18); ctx.restore();
    label(ctx, Math.round(g.fuel) + ' / ' + g.fuelMax + ' GAL · CRITICAL', 40, y + 86, 13, '#E5484D');
  } else {
    label(ctx, Math.round(g.fuel) + ' / ' + g.fuelMax + ' GAL', 40, y + 86, 13, '#1C1917');
    label(ctx, 'BURN ' + (0.9 + g.throttle * 2.4).toFixed(1) + '/s', 180, y + 86, 12, '#44403C');
  }
  // Artificial horizon & compass — pitch ladder, bank needle, tick ring.
  panel(ctx, 324, y, 300, h, PAL.cream);
  text(ctx, 'HORIZON & COMPASS', 338, y + 26, 14, '#7C2D12');
  // v2.4 (climax): the horizon reads a sharp 63° bank, not ~0° — the
  // sky/ground halves and pitch ladder inside the ball tilt with it.
  const bankDeg = g.climax ? 63 : Math.round(Math.sin(g.t) * 12);
  ctx.save();
  ctx.beginPath(); ctx.arc(380, y + 68, 30, 0, Math.PI * 2); ctx.clip();
  ctx.translate(380, y + 68);
  ctx.rotate(g.climax ? -bankDeg * Math.PI / 180 : 0);
  ctx.fillStyle = '#7FB8D8'; ctx.fillRect(-30, -30, 60, 30);
  ctx.fillStyle = '#B45309'; ctx.fillRect(-30, 0, 60, 30);
  // pitch ladder lines inside the ball
  ctx.strokeStyle = 'rgba(28,25,23,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(22, -16); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, 16); ctx.lineTo(18, 16); ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.arc(380, y + 68, 30, 0, Math.PI * 2); ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2.5; ctx.stroke();
  // tick ring (N/E/S/W) around the ball
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = i % 2 === 0 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(380 + Math.cos(a) * 30, y + 68 + Math.sin(a) * 30);
    ctx.lineTo(380 + Math.cos(a) * 35, y + 68 + Math.sin(a) * 35);
    ctx.stroke();
  }
  // bank needle at the top of the ball
  ctx.save();
  ctx.translate(380, y + 68); ctx.rotate(bankDeg * Math.PI / 180);
  ctx.fillStyle = '#E5484D';
  ctx.beginPath(); ctx.moveTo(-5, -30); ctx.lineTo(5, -30); ctx.lineTo(0, -38); ctx.closePath(); ctx.fill();
  ctx.restore();
  // level wings line — v2.3 climax: tilted sharply with the 45° bank.
  ctx.save();
  ctx.translate(380, y + 68); ctx.rotate(g.climax ? -bankDeg * Math.PI / 180 : 0);
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
  ctx.restore();
  const hdg = Math.round(((g.heading * 57.2958) % 360 + 360) % 360);
  label(ctx, 'HDG ' + String(hdg).padStart(3, '0') + '°', 430, y + 62, 16, '#1C1917');
  label(ctx, 'BANK ' + bankDeg + '°', 430, y + 88, 12, g.climax ? '#E5484D' : '#44403C');
  // Wing temperature — zone-coloured bar + ticks + needle.
  panel(ctx, 636, y, 300, h, PAL.cream);
  text(ctx, 'WING TEMPERATURE', 650, y + 26, 14, '#7C2D12');
  ctx.fillStyle = '#2A2F3A'; ctx.fillRect(650, y + 44, 260, 18);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(650, y + 44, 260 * 0.25, 18);
  ctx.fillStyle = '#D97706'; ctx.fillRect(650 + 260 * 0.25, y + 44, 260 * 0.5, 18);
  ctx.fillStyle = '#E5484D'; ctx.fillRect(650 + 260 * 0.75, y + 44, 260 * 0.25, 18);
  const wt = Math.max(0, Math.min(1, g.wingTemp / 115));
  ctx.strokeStyle = 'rgba(245,239,230,0.9)'; ctx.lineWidth = 2;
  ctx.strokeRect(650 + 260 * wt - 1, y + 42, 3, 22);
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2; ctx.strokeRect(650, y + 44, 260, 18);
  for (let i = 0; i <= 4; i++) {
    const tx = 650 + i * 65;
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, y + 40); ctx.lineTo(tx, y + 66); ctx.stroke();
  }
  const wx = 650 + 260 * wt;
  ctx.fillStyle = '#1C1917';
  ctx.beginPath(); ctx.moveTo(wx - 6, y + 38); ctx.lineTo(wx + 6, y + 38); ctx.lineTo(wx, y + 46); ctx.closePath(); ctx.fill();
  label(ctx, Math.round(g.wingTemp) + '°C  ·  ICE ' + Math.round(g.ice) + '%', 668, y + 86, 13, '#1C1917');
  // v2.4 (climax): wing bar glows red-orange, full emergency warning on
  // its own line — ICE 84% · STALL RISK.
  if (g.climax) {
    ctx.save(); ctx.shadowColor = '#EA580C'; ctx.shadowBlur = 12;
    ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 2.5; ctx.strokeRect(650, y + 44, 260, 18); ctx.restore();
    label(ctx, 'ICE 84% · STALL RISK', 650, y + 104, 11, '#E5484D');
  } else {
    label(ctx, '[H] HEAT  [1/2/3] LAYER', 790, y + 86, 11, '#44403C');
  }
  // Aurora lock stamp — v2.1: stamp shrunk and moved up so it clears both
  // the header and the HULL line; 12 lock dots sit on their own row.
  panel(ctx, 948, y, 320, h, PAL.cream);
  text(ctx, 'AURORA LOCK', 962, y + 26, 14, '#7C2D12');
  ctx.save();
  ctx.translate(1108, y + 54); ctx.rotate(-0.1);
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 2.5; ctx.strokeRect(-84, -19, 168, 38);
  label(ctx, 'AURORA LOCK ×12', -76, 5, 15, '#B45309');
  ctx.restore();
  for (let i = 0; i < 12; i++) {
    ctx.beginPath(); ctx.arc(966 + i * 10, y + 86, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981'; ctx.fill();
    ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 1; ctx.stroke();
  }
  label(ctx, 'HULL ' + Math.round(g.hull) + '%  ·  SAMPLES ' + g.samples, 962, y + 104, 12, '#1C1917');
}

export function matrixBoxes(ctx, x, y, w) {
  // 8 real matrix boxes in a row
  const items = [['6', 'SECTORS'], ['14', 'PHENOMENA'], ['6', 'CREW'], ['18', 'MODULES'],
    ['12', 'EVENTS'], ['20', 'FEATS'], ['3', 'ALTITUDES'], ['4', 'MODES']];
  const bw = (w - 7 * 6) / 8;
  items.forEach(([n, l], i) => {
    const bx = x + i * (bw + 6);
    panel(ctx, bx, y, bw, 64, '#141B2C');
    text(ctx, n, bx + bw / 2, y + 30, 26, PAL.gold, 900, 'center');
    label(ctx, l, bx + bw / 2, y + 52, 10, '#F5EFE6', 'center');
  });
}

export function messageBanner(ctx, g) {
  if (g.msgT > 0 && g.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, g.msgT);
    darkPanel(ctx, 340, 100, 600, 40);
    label(ctx, g.message, 640, 126, 15, '#F5EFE6', 'center');
    ctx.restore();
  }
}
export function dialogueBox(ctx, g) {
  const c = CREW[g.dialogue % CREW.length];
  panel(ctx, 240, 470, 800, 78, PAL.cream);
  drawCrew(ctx, c, 282, 509, 28);
  // v2.4 (climax): Kobayashi's exact line (verbatim, em-dash).
  // The name stays clean bold Dark Navy/Terracotta on cream — no black
  // stroke artifact. Header already carries "MET. AYA KOBAYASHI", so the
  // quoted line is the spoken words exactly as briefed.
  const line = (g.climax && c.name.startsWith('MET.'))
    ? 'Stall and lightning — heat the wings and break left, now!'
    : c.line;
  text(ctx, c.name + ' — ' + c.role.toUpperCase(), 326, 500, 14, '#7C2D12');
  label(ctx, '“' + line + '”', 326, 526, 15, '#1C1917');
}
