// render.js — one job: draw every screen (title / play / refit / storm / logbook).
import { PAL, W, H, INK, SECTORS, CREW, MODULES, PHENOMENA, FEATS, EVENTS, ALTITUDES, MODES, SET_BONUS } from './config.js';
import { panel, darkPanel, text, label, drawAircraft, drawAurora, drawPeaks, drawCrew, drawRefitArt, poly, ellipse } from './art.js';
import { topBar, leftPanel, rightPanel, bottomInstruments, matrixBoxes, messageBanner, dialogueBox } from './hud.js';
import { setBonus } from './flight.js';

export function drawWindStreaks(ctx, g, n) {
  // v2.1 Fix 2: deterministic speed lines — the plane must feel fast,
  // never a floating sprite. g.t is fixed in every ?shot= state.
  ctx.save();
  for (let i = 0; i < n; i++) {
    const y = 90 + ((i * 97 + 40) % 520);
    const x = (i * 211 + 60) % 1280;
    const len = 70 + ((i * 53) % 130);
    const drift = (g.t * 30 * (1 + (i % 3) * 0.4)) % 1280;
    const sx = (x - drift + 1280) % 1280;
    ctx.strokeStyle = 'rgba(234,246,251,' + (0.10 + (i % 3) * 0.05).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + len, y + (i % 2 ? 3 : -3)); ctx.stroke();
  }
  ctx.restore();
}

export function drawNearPeaks(ctx) {
  // v2.1 Fix 2: NEAR jagged ice mountains below the aircraft — two-tone
  // faces (shadow left / lit right), white snow caps, valley shadows,
  // layered ice fog. The low, fast Arctic-terrain layer.
  for (let i = 0; i < 8; i++) {
    const x0 = i * 175 - 60 + ((i * 53) % 50);
    const px = x0 + 95, py = 720 - 140 - ((i * 67) % 90);
    ctx.beginPath(); ctx.moveTo(x0, 720); ctx.lineTo(px, py); ctx.lineTo(px, 720); ctx.closePath();
    ctx.fillStyle = '#3D5A78'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x0 + 190, 720); ctx.lineTo(px, 720); ctx.closePath();
    ctx.fillStyle = '#7FA8C4'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 26, py + 44); ctx.lineTo(px + 10, py + 30); ctx.lineTo(px + 26, py + 44); ctx.closePath();
    ctx.fillStyle = 'rgba(234,246,251,0.95)'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, 720); ctx.lineTo(px, py); ctx.lineTo(x0 + 190, 720); ctx.stroke();
    // valley shadow in the gap to the next peak
    const gx = x0 + 165;
    ctx.fillStyle = 'rgba(11,17,32,0.4)';
    ctx.beginPath(); ctx.moveTo(gx, 720); ctx.lineTo(gx + 44, 720); ctx.lineTo(gx + 22, 648); ctx.closePath(); ctx.fill();
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(234,246,251,' + (0.10 - i * 0.02).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(300 + i * 340, 640 + i * 28, 320, 20, 0, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawSky(ctx, g, world) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#070D1A');
  grad.addColorStop(0.45, PAL.night);
  grad.addColorStop(0.75, '#16233F');
  grad.addColorStop(1, '#1E2F4D');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  // stars
  ctx.fillStyle = 'rgba(234,246,251,0.9)';
  for (let i = 0; i < 90; i++) {
    const x = (i * 137.5 + 31) % 1280, y = (i * 89.3 + 17) % 260;
    ctx.fillRect(x, y, 2, 2);
  }
  drawAurora(ctx, g.t, g.sector);
  // cloud layer seen from above (soft, layered ellipses — not flat boxes)
  for (let i = 0; i < 14; i++) {
    const cx = ((i * 211 + 40 - g.t * 12) % 1400 + 1400) % 1400 - 60;
    const cy = 430 + (i % 4) * 62;
    ctx.fillStyle = 'rgba(180,205,225,0.16)';
    ctx.beginPath(); ctx.ellipse(cx, cy, 150 + (i % 3) * 40, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(234,246,251,0.10)';
    ctx.beginPath(); ctx.ellipse(cx + 30, cy - 8, 110, 16, 0, 0, Math.PI * 2); ctx.fill();
  }
  drawPeaks(ctx, world.peaks, g.px);
}

export function drawRings(ctx, g) {
  for (const r of g.rings) {
    const sx = 640 + (r.x - g.px) * 0.55;
    const sy = r.y + Math.sin(g.t * 2 + r.idx) * 6;
    if (sx < -120 || sx > 1400) continue;
    const taken = r.taken;
    const pulse = 1 + Math.sin(g.t * 4) * 0.06;
    ctx.save();
    ctx.translate(sx, sy); ctx.scale(pulse, pulse);
    ctx.globalAlpha = taken ? 0.25 : 1;
    ctx.beginPath(); ctx.ellipse(0, 0, r.r, r.r * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = taken ? '#7A8699' : '#10B981'; ctx.lineWidth = 7; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, r.r - 12, (r.r - 12) * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = taken ? '#7A8699' : '#D946EF'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    if (!taken) {
      label(ctx, 'GATE ' + (r.idx + 1), sx - 28, sy - r.r - 8, 13, '#F5EFE6');
    }
  }
  // next-ring arrow
  const ring = g.rings[g.ringIdx];
  if (ring) {
    const sx = 640 + (ring.x - g.px) * 0.55;
    if (sx > 1280) { label(ctx, 'NEXT GATE ➤ ' + Math.round((ring.x - g.px)) + 'm', 1080, 120, 15, PAL.gold); }
  }
}

export function drawSnow(ctx, g, world, storm) {
  const n = storm ? 220 : 120;
  ctx.fillStyle = 'rgba(234,246,251,0.85)';
  for (let i = 0; i < n; i++) {
    const s = world.snow[i % world.snow.length];
    const x = ((s.x * 1280 + g.t * s.v * (storm ? 2.4 : 1) + g.px * 0.05) % 1280 + 1280) % 1280;
    const y = ((s.y * 720 + g.t * s.v * 0.9) % 720 + 720) % 720;
    ctx.fillRect(x, y, s.s, s.s);
  }
  // v2.2 Fix 2: climax lightning — TWO bright magenta-cyan bolts, drawn
  // every frozen frame: one tight by the wingtip (x 880), one striking
  // the jagged ridge below (x 300). Both stay clear of the HDG readout
  // column (x 320–520 at the top bar; the ridge bolt zigzags to 330 max
  // and sits far below the top bar, the wingtip bolt is at x 880).
  if (g.climax) {
    const bolt = (bx, top, bottom, ph) => {
      const trace = (color, lw) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
        ctx.beginPath();
        let lx = bx, ly = top;
        ctx.moveTo(lx, ly);
        for (let k = 0; k < 7; k++) { lx += Math.sin(k * 3 + ph) * 28; ly += (bottom - top) / 7; ctx.lineTo(lx, ly); }
        ctx.stroke();
      };
      ctx.save(); ctx.shadowColor = '#D946EF'; ctx.shadowBlur = 14;
      trace('rgba(34,211,238,0.9)', 6);
      trace('rgba(217,70,239,0.95)', 3);
      trace('rgba(255,255,255,0.95)', 1.2);
      ctx.restore();
    };
    bolt(880, 96, 400, 1.2);
    bolt(300, 300, 640, 4.1);
  }
  if (storm && !g.climax) {
    // Lightning arcs — v2.1: purple-cyan two-tone, striking cloud tops
    // BELOW the top bar, and never in the HDG readout column (x 320–520).
    const b = world.bolts[Math.floor(g.t * 0.7) % world.bolts.length];
    // Never in the HDG readout column (x 320–520): shift the bolt to a
    // safe column (x 980, clear of the nose and the right panel) instead
    // of dropping it, so lightning is always visible in the storm shot.
    let bx = b.x * 1280;
    if (bx >= 320 && bx <= 520) bx = 980;
    if (Math.floor(g.t * 2) % 3 === 0) {
      const trace = (color, lw) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
        ctx.beginPath();
        let lx = bx, ly = 100;
        ctx.moveTo(lx, ly);
        for (let k = 0; k < 6; k++) { lx += (Math.sin(k * 3 + b.ph) * 30); ly += 48; ctx.lineTo(lx, ly); }
        ctx.stroke();
      };
      trace('rgba(34,211,238,0.85)', 5);
      trace('rgba(217,70,239,0.9)', 2.5);
      trace('rgba(255,255,255,0.9)', 1);
    }
  }
}

export function drawPlay(ctx, g, world) {
  drawSky(ctx, g, world);
  drawRings(ctx, g);
  const bank = Math.sin(g.t * 0.8) * 0.14 + (g.storm ? Math.sin(g.t * 2.1) * 0.12 : 0);
  drawAircraft(ctx, 640, 330 + Math.sin(g.t * 1.3) * 8, 1.55, bank, g.t, { crew: 2, mods: g.modules.map((m) => m.id), iced: g.storm, storm: g.storm });
  drawSnow(ctx, g, world, g.storm);
  topBar(ctx, g);
  leftPanel(ctx, g);
  rightPanel(ctx, g);
  bottomInstruments(ctx, g);
  messageBanner(ctx, g);
  // sector progress
  label(ctx, 'GATES ' + g.ringIdx + '/' + g.rings.length + '   FUEL ' + Math.round(g.fuel) + '%   HULL ' + Math.round(g.hull) + '%', 640, 92, 14, '#F5EFE6', 'center');
  if (g.paused) { darkPanel(ctx, 440, 300, 400, 90); text(ctx, 'PAUSED — P to resume', 640, 355, 24, '#F5EFE6', 800, 'center'); }
}

export function drawTitle(ctx, g, world) {
  // v2.1 Fix 2 — full-bleed scenic title poster (NOT a gameplay duplicate):
  // thick glowing aurora curtain, big winged aircraft piercing it above
  // jagged ice peaks, gold-white title across the top, PLAY + Saved
  // Expeditions on the left, HOW TO PLAY on the right, all 8 real matrix
  // boxes along the bottom. Deterministic ?shot=start state.
  drawSky(ctx, g, world);
  drawAurora(ctx, g.t, g.sector, 1.7); // second, thicker aurora pass
  drawWindStreaks(ctx, g, 12); // v2.1 Fix 2: speed lines
  drawNearPeaks(ctx); // v2.1 Fix 2: near ice mountains + valley fog
  // big title — gold-white inked lettering with a FIRM outline (forced on)
  text(ctx, 'STRATOSPHERE OBSERVATORY', 640, 78, 46, '#FDF3C4', 900, 'center', 'Georgia, serif', true);
  // v2.2 Fix 1: subtitle lifted off the brightest aurora band — a solid
  // dark navy strip behind it, shrunk to 12px and nudged up, so "ARCTIC"
  // stays fully legible and clear of the PRESS ENTER panel below.
  ctx.fillStyle = 'rgba(11,17,32,0.88)';
  ctx.fillRect(408, 86, 464, 24);
  ctx.strokeStyle = PAL.brass; ctx.lineWidth = 1.5; ctx.strokeRect(408, 86, 464, 24);
  label(ctx, 'ARCTIC EXPEDITION AIRCRAFT · 1928 POLAR FLIGHT', 640, 102, 12, PAL.ice, 'center');
  // the aircraft, large, banking ~26° and piercing the aurora (Fix 2)
  drawAircraft(ctx, 640, 360, 1.9, -0.45, g.t, { crew: 2, mods: g.modules.map((m) => m.id) });
  drawSnow(ctx, g, world, false);
  // left column: PLAY panel + Saved Expeditions
  darkPanel(ctx, 40, 140, 330, 168);
  text(ctx, 'PRESS ENTER TO FLY', 205, 188, 24, PAL.gold, 900, 'center');
  label(ctx, '5-SECOND HOOK: gates ahead,', 205, 220, 13, '#F5EFE6', 'center');
  label(ctx, 'storm behind — go.', 205, 240, 13, '#F5EFE6', 'center');
  label(ctx, 'M — mute · P — pause · ?auto=1 autopilot', 205, 276, 12, '#94A3B8', 'center');
  darkPanel(ctx, 40, 322, 330, 176);
  text(ctx, 'SAVED EXPEDITIONS', 56, 354, 16, PAL.gold);
  const saves = ['EXPEDITION I — FROSTBITE RIDGE · RANK A', 'EXPEDITION II — AURORA REACH · RANK S', 'EXPEDITION III — MAGNETIC GALE · ACTIVE'];
  saves.forEach((s, i) => label(ctx, '✦ ' + s, 56, 384 + i * 26, 13, '#F5EFE6'));
  label(ctx, 'Fly the aurora. Warm the wings.', 56, 470, 13, PAL.brass);
  // right column: HOW TO PLAY (solid cream, clean dark-navy headers)
  panel(ctx, 910, 140, 330, 216, PAL.cream);
  text(ctx, 'HOW TO PLAY', 934, 172, 18, '#7C2D12');
  const steps = [
    '1  ARROWS / WASD — steer &',
    'throttle · fly the glowing gates',
    '2  H — wing heat (ice vs overheat)',
    '1 / 2 / 3 — climb & dive layers',
    '3  Clear a sector → PICK 1 OF 3',
    'refit modules · 6 sectors to RANK S',
  ];
  steps.forEach((s, i) => label(ctx, s, 934, 200 + i * 24, 13, '#1C1917'));
  // v2.1 Fix 2: glowing green-gold aurora sky-gates in perspective,
  // receding in a row ahead of the aircraft.
  const gates = [[920, 440, 52], [1052, 478, 38], [1148, 508, 26]];
  for (const [gx, gy, gr] of gates) {
    ctx.save();
    ctx.shadowColor = '#10B981'; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#10B981'; ctx.lineWidth = 7; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, gr - 11, (gr - 11) * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#F2B705'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  label(ctx, 'TARGET RING AHEAD', 920, 372, 13, '#F5EFE6', 'center');
  // 8 real matrix boxes across the bottom
  matrixBoxes(ctx, 60, 606, 1160);
}

export function drawRefit(ctx, g) {
  drawSky(ctx, g, { peaks: [], snow: [], bolts: [] });
  panel(ctx, 40, 24, 1200, 64, PAL.cream);
  text(ctx, 'AIRFRAME & ENGINE REFIT', 64, 62, 30, '#7C2D12');
  label(ctx, 'SECTOR ' + (g.sector - 1) + ' CLEAR · PICK 1 OF 3 — press 1, 2 or 3', 700, 60, 16, '#1C1917');
  // cross-section aircraft, centre
  drawAircraft(ctx, 640, 212, 1.5, 0, g.t, { crew: 2 });
  label(ctx, 'CROSS-SECTION: TWIN-BOOM AIRFRAME · COPPER WINGS · BRASS COCKPIT', 640, 322, 13, '#F5EFE6', 'center');
  // 3 module cards — v2.1 Fix 3: a large mechanical illustration in the
  // middle of each card (twin tail fins / heated propeller / fuel tank).
  g.draft.forEach((m, i) => {
    const x = 60 + i * 400;
    panel(ctx, x, 340, 380, 225, PAL.cream);
    text(ctx, (i + 1) + ' · ' + m.name, x + 20, 374, 17, '#7C2D12');
    label(ctx, 'SET: ' + m.set, x + 20, 398, 13, '#B45309');
    drawRefitArt(ctx, m.id, x + 190, 460, 1.0);
    label(ctx, m.fx, x + 20, 520, 13, '#1C1917');
    const words = m.desc.split(' ');
    const lines = [''];
    for (const w of words) {
      if ((lines[lines.length - 1] + ' ' + w).trim().length > 46) lines.push(w);
      else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
    }
    lines.slice(0, 2).forEach((ln, li) => label(ctx, ln, x + 20, 542 + li * 17, 11, '#44403C'));
  });
  // Set synergy row — solid
  const sets = setBonus({ modules: [...g.modules, ...(g.draft[0] ? [g.draft[0]] : [])] });
  panel(ctx, 60, 575, 1160, 85, '#141B2C');
  text(ctx, 'SET SYNERGY', 84, 606, 16, PAL.gold);
  const owned = {};
  for (const m of g.modules) owned[m.set] = (owned[m.set] || 0) + 1;
  const rows = Object.keys(SET_BONUS).map((s) => s + ' ' + (owned[s] || 0) + '/2 — ' + SET_BONUS[s]);
  label(ctx, rows.slice(0, 2).join('   ·   '), 84, 630, 12, '#F5EFE6');
  label(ctx, rows.slice(2).join('   ·   '), 84, 648, 12, '#F5EFE6');
  label(ctx, 'SCORE ' + g.score + ' · MODULES ' + g.modules.length + '/18', 1000, 630, 13, PAL.gold);
}

export function drawStorm(ctx, g, world) {
  // Shot 3: magnetic gale climax — cockpit-first, crew behind glass
  drawSky(ctx, g, world);
  drawAurora(ctx, g.t, g.sector, 1.6); // v2.1: sharper, thicker aurora glow
  drawWindStreaks(ctx, g, 30); // v2.2: denser speed lines for the climax
  // v2.2 Fix 2: fast white storm wind lines streaking across the screen.
  ctx.save();
  for (let i = 0; i < 14; i++) {
    const wy = 110 + ((i * 173 + 60) % 460);
    const wx = (i * 307 + 40) % 1280;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.28 + (i % 3) * 0.08).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 190, wy + 14); ctx.stroke();
  }
  ctx.restore();
  drawNearPeaks(ctx); // v2.1 Fix 2: near ice mountains + valley fog
  drawRings(ctx, g);
  // v2.2 Fix 2: 3 glowing aurora rings top-right, nearly missed by the
  // crosswind push — tucked into the free sky left of the crew panel.
  for (const [gx, gy, gr] of [[948, 178, 44], [1010, 130, 30], [1032, 98, 16]]) {
    ctx.save();
    ctx.shadowColor = '#10B981'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#10B981'; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, gr - 11, (gr - 11) * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#F2B705'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  // v2.2 Fix 2: the small duplicate "AURORA LOCK ×12" that sat here at
  // top centre is REMOVED — only the clean stamp at bottom-right shows.
  // v2.2 Fix 2: sharp 40° banking (-0.70 rad) + climax ice / heat visuals.
  drawAircraft(ctx, 640, 320, 1.9, -0.70, g.t, { crew: 3, mods: g.modules.map((m) => m.id), iced: true, storm: true, climax: true });
  // v2.1: white smoke trails off the wingtips + orange engine sparks
  // from the propellers (deterministic positions from the fixed shot time).
  for (let i = 0; i < 8; i++) {
    const sx = 640 - 300 - i * 42, sy = 300 + Math.sin(i * 1.3 + g.t) * 14 + i * 3;
    ctx.fillStyle = 'rgba(234,246,251,' + (0.55 - i * 0.055).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(sx, sy, 26 - i * 1.5, 9, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 10; i++) {
    const px = 902 + Math.sin(i * 2.7 + g.t * 3) * 26, py = 320 + Math.cos(i * 1.9 + g.t * 2) * 22;
    ctx.fillStyle = i % 2 ? '#FDBA74' : '#FDE68A';
    ctx.beginPath(); ctx.arc(px, py, i % 3 === 0 ? 3 : 2, 0, Math.PI * 2); ctx.fill();
  }
  drawSnow(ctx, g, world, true);
  // solid cream side panels with dark frames
  panel(ctx, 12, 92, 220, 260, PAL.cream);
  text(ctx, 'MAGNETIC GALE', 26, 122, 18, '#7C2D12');
  label(ctx, 'SECTOR 3 · STORM RUN', 26, 146, 12, '#B45309');
  label(ctx, 'Compass lying — trust', 26, 172, 12, '#1C1917');
  label(ctx, 'the gyro, not the needle.', 26, 190, 12, '#1C1917');
  label(ctx, 'Lightning arcs ahead.', 26, 214, 12, '#1C1917');
  label(ctx, 'Hold the gates. Hold', 26, 232, 12, '#1C1917');
  label(ctx, 'the wings warm.', 26, 250, 12, '#1C1917');
  text(ctx, 'PHENOMENA', 26, 292, 14, '#7C2D12');
  label(ctx, '◆ ' + PHENOMENA[3].name, 26, 316, 12, '#1C1917');
  label(ctx, '◆ ' + PHENOMENA[8].name, 26, 336, 12, '#1C1917');
  panel(ctx, 1048, 92, 220, 260, PAL.cream);
  text(ctx, 'CREW ON DECK', 1062, 122, 16, '#7C2D12');
  CREW.slice(0, 3).forEach((c, i) => {
    const y = 150 + i * 62;
    drawCrew(ctx, c, 1090, y, 22);
    label(ctx, c.name, 1122, y - 4, 12, '#1C1917');
    label(ctx, c.role.toUpperCase(), 1122, y + 12, 10, '#7C2D12');
  });
  topBar(ctx, g);
  dialogueBox(ctx, g);
  bottomInstruments(ctx, g);
  messageBanner(ctx, g);
}

export function drawLogbook(ctx, g) {
  // Shot 4: expedition archive / Rank S
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1A120B'); grad.addColorStop(1, '#0B1120');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  drawAurora(ctx, g.t, 0);
  panel(ctx, 40, 24, 1200, 672, '#2A1F14');
  // open journal — two cream pages
  panel(ctx, 70, 60, 560, 600, PAL.cream);
  panel(ctx, 650, 60, 560, 600, PAL.cream2);
  text(ctx, 'EXPEDITION ARCHIVE', 90, 100, 26, '#7C2D12');
  text(ctx, 'RANK S', 600, 100, 40, '#B45309', 900, 'right');
  label(ctx, 'STRATOSPHERE OBSERVATORY · 1928 POLAR FLIGHT', 90, 124, 12, '#44403C');
  label(ctx, 'FINAL SCORE ' + g.score.toLocaleString(), 90, 152, 15, '#1C1917');
  // altitude graph
  text(ctx, 'FLIGHT ALTITUDE GRAPH', 90, 190, 15, '#7C2D12');
  ctx.strokeStyle = '#1C1917'; ctx.lineWidth = 2;
  ctx.strokeRect(90, 200, 520, 130);
  ctx.beginPath();
  const pts = [0.3, 0.5, 0.42, 0.75, 0.6, 0.9, 0.7, 0.85, 0.95, 0.8];
  pts.forEach((p, i) => {
    const x = 90 + (i / 9) * 520, y = 330 - p * 120;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10B981'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#D946EF';
  pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(90 + (i / 9) * 520, 330 - p * 120, 4, 0, Math.PI * 2); ctx.fill(); });
  label(ctx, 'LOWER ICE', 90, 352, 11, '#44403C');
  label(ctx, 'JET STREAM', 280, 352, 11, '#44403C');
  label(ctx, 'AURORA STRATOSPHERE', 440, 352, 11, '#44403C');
  // crew portraits — 6 surviving crew
  text(ctx, 'THE SIX WHO FLEW HOME', 90, 396, 15, '#7C2D12');
  CREW.forEach((c, i) => {
    const x = 120 + i * 88;
    drawCrew(ctx, c, x, 440, 30);
    label(ctx, c.name.split(' ')[1], x, 486, 11, '#1C1917', 'center');
  });
  // feats medals — right page
  text(ctx, 'EXPEDITION FEATS · ' + g.feats.length + '/20', 670, 100, 18, '#7C2D12');
  const show = FEATS.slice(0, 20);
  show.forEach((f, i) => {
    const x = 670 + (i % 2) * 270, y = 128 + Math.floor(i / 2) * 30;
    const got = g.feats.includes(f);
    ctx.beginPath(); ctx.arc(x + 10, y - 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = got ? '#F2B705' : '#C9BFA8'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, (got ? '★ ' : '○ ') + f, x + 26, y, 12, got ? '#1C1917' : '#78716C');
  });
  // atmospheric samples
  // v2.2 Fix 3: 8 copper-capped glass sample tubes with glowing aurora
  // gas inside — detailed expedition artifacts, not plain colour blocks.
  text(ctx, 'ATMOSPHERIC SAMPLES', 670, 460, 15, '#7C2D12');
  for (let i = 0; i < 8; i++) {
    const x = 690 + i * 58;
    const gas = i < 5 ? '#10B981' : '#D946EF';
    // glowing gas column inside the glass
    ctx.save(); ctx.shadowColor = gas; ctx.shadowBlur = 12;
    ctx.fillStyle = gas; ctx.fillRect(x + 6, 494, 22, 34); ctx.restore();
    // glass tube body (translucent white over the gas) + ink outline
    ctx.fillStyle = 'rgba(245,239,230,0.28)'; ctx.fillRect(x + 2, 488, 30, 44);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 2, 488, 30, 44);
    // gas bubbles rising in the tube
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(x + 14, 502, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 22, 516, 2, 0, Math.PI * 2); ctx.fill();
    // glass highlight + copper cap with rivets
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x + 6, 490, 4, 40);
    ctx.fillStyle = '#B45309'; ctx.fillRect(x + 2, 478, 30, 10);
    ctx.fillStyle = 'rgba(255,214,130,0.8)'; ctx.fillRect(x + 2, 478, 30, 3);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x + 2, 478, 30, 10);
    ctx.fillStyle = '#1C1917';
    ctx.beginPath(); ctx.arc(x + 9, 483, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 25, 483, 1.6, 0, Math.PI * 2); ctx.fill();
    label(ctx, 'S' + (i + 1), x + 17, 556, 11, '#1C1917', 'center');
  }
  label(ctx, 'Samples: aurora green ×5 · magnetic magenta ×3 — copper-capped glass tubes.', 670, 586, 12, '#44403C');
  label(ctx, 'PRESS ENTER TO FLY AGAIN', 670, 624, 14, '#7C2D12');
  label(ctx, 'Sectors cleared ' + g.sorties + ' · Rings flown ' + g.ringIdx + ' · Feats ' + g.feats.length + '/20', 90, 624, 12, '#44403C');
}

export function drawOver(ctx, g, world) {
  drawSky(ctx, g, world);
  panel(ctx, 340, 220, 600, 260, PAL.cream);
  text(ctx, 'EXPEDITION LOST', 640, 300, 40, '#7C2D12', 900, 'center');
  label(ctx, g.message || 'The ice keeps its secrets.', 640, 340, 16, '#1C1917', 'center');
  label(ctx, 'SCORE ' + g.score + ' · SECTOR ' + g.sector + '/6 · RANK ' + g.rank, 640, 380, 15, '#44403C', 'center');
  label(ctx, 'PRESS ENTER TO FLY AGAIN', 640, 430, 15, '#B45309', 'center');
}
