// render.js — one job: draw every screen (title / play / refit / storm / logbook).
import { PAL, W, H, INK, SECTORS, CREW, MODULES, PHENOMENA, FEATS, EVENTS, ALTITUDES, MODES, SET_BONUS } from './config.js';
import { panel, darkPanel, text, label, drawAircraft, drawChaseAircraft, drawAurora, drawPeaks, drawCrew, drawRefitArt, poly, ellipse } from './art.js';
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
  // v2.3: climax lightning — TWO GIANT magenta-cyan bolts, drawn every
  // frozen frame: one tight by the nose/wingtip (x 860, clears the
  // aurora rings at x >= 904), one striking the jagged ridge below
  // (x 300, right by the diving tail fin). Both stay clear of the HDG
  // readout column (x 320–520 at the top bar; the ridge bolt zigzags to
  // 336 max and sits far below the top bar, the wingtip bolt is at
  // x 860). Thicker traces + wider zigzag than v2.2 so they read at 300px.
  // v2.4: SUPPRESSED for the chase-view shot (g.chase24) — the near-miss
  // bolt is drawn in drawStorm instead, a few px off the right wingtip.
  if (g.climax && !g.chase24) {
    const bolt = (bx, top, bottom, ph, amp) => {
      const trace = (color, lw) => {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
        ctx.beginPath();
        let lx = bx, ly = top;
        ctx.moveTo(lx, ly);
        for (let k = 0; k < 7; k++) { lx += Math.sin(k * 3 + ph) * amp; ly += (bottom - top) / 7; ctx.lineTo(lx, ly); }
        ctx.stroke();
      };
      ctx.save(); ctx.shadowColor = '#D946EF'; ctx.shadowBlur = 20;
      trace('rgba(34,211,238,0.9)', 10);
      trace('rgba(217,70,239,0.95)', 5);
      trace('rgba(255,255,255,0.95)', 2);
      ctx.restore();
    };
    bolt(860, 64, 450, 1.2, 32);
    bolt(300, 280, 660, 4.1, 36);
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

export function drawCanyon3D(ctx) {
  // v2.4: a 3D ice-peak canyon in perspective — two jagged walls
  // converging on the vanishing point (640, 300), a receding spine of
  // sharp peaks down the canyon floor, layered ice fog. The walls stop
  // short of the side panels (ridge line only reaches y 300 at x 640).
  const VPX = 640, VPY = 300;
  // distant peaks ringing the vanishing point (small, far)
  for (const [dx, dw, dh] of [[-120, 70, 46], [-58, 52, 34], [8, 62, 40], [72, 48, 30], [128, 66, 42]]) {
    ctx.beginPath();
    ctx.moveTo(VPX + dx - dw / 2, VPY + 6); ctx.lineTo(VPX + dx, VPY + 6 - dh); ctx.lineTo(VPX + dx + dw / 2, VPY + 6);
    ctx.closePath();
    ctx.fillStyle = '#4A6B8A'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(VPX + dx - 10, VPY + 6 - dh + 14); ctx.lineTo(VPX + dx, VPY + 6 - dh); ctx.lineTo(VPX + dx + 10, VPY + 6 - dh + 14);
    ctx.closePath();
    ctx.fillStyle = 'rgba(234,246,251,0.9)'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  }
  // left wall — dark shadow face, SAWTOOTH ridge (pass 2: the smooth
  // ridge read as a dome, not a jagged canyon)
  const leftRidge = [[0, 580], [36, 548], [90, 568], [140, 500], [190, 530], [250, 470], [300, 498], [360, 430], [410, 458], [470, 392], [520, 418], [570, 348], [610, 330], [VPX, VPY]];
  ctx.beginPath();
  ctx.moveTo(0, 720);
  for (const [x, y] of leftRidge) ctx.lineTo(x, y);
  ctx.lineTo(VPX, 720); ctx.closePath();
  ctx.fillStyle = '#2E4A68'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 580);
  for (const [x, y] of leftRidge) ctx.lineTo(x, y);
  ctx.stroke();
  // right wall — lit face, sawtooth ridge
  const rightRidge = [[1280, 580], [1244, 548], [1190, 568], [1140, 500], [1090, 530], [1030, 470], [980, 498], [920, 430], [870, 458], [810, 392], [760, 418], [710, 348], [670, 330], [VPX, VPY]];
  ctx.beginPath();
  ctx.moveTo(1280, 720);
  for (const [x, y] of rightRidge) ctx.lineTo(x, y);
  ctx.lineTo(VPX, 720); ctx.closePath();
  ctx.fillStyle = '#4A6B8A'; ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(1280, 580);
  for (const [x, y] of rightRidge) ctx.lineTo(x, y);
  ctx.stroke();
  // snow caps on the ridge vertices
  ctx.fillStyle = 'rgba(234,246,251,0.95)';
  for (const [x, y] of [[140, 500], [360, 430], [570, 348], [1140, 500], [920, 430], [710, 348]]) {
    ctx.beginPath(); ctx.moveTo(x - 18, y + 8); ctx.lineTo(x, y - 12); ctx.lineTo(x + 18, y + 8); ctx.closePath(); ctx.fill();
  }
  // wall facets: alternating dark/light rock faces + snow streaks running
  // down from the ridge, so the walls read as broken rock, not flat fill
  ctx.fillStyle = 'rgba(11,17,32,0.30)';
  for (const [x, y, w, h] of [[120, 560, 90, 90], [300, 500, 110, 110], [470, 420, 90, 90], [1080, 560, 90, 90], [900, 500, 110, 110], [740, 420, 90, 90]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h * 0.4); ctx.lineTo(x + w * 0.4, y + h); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(234,246,251,0.22)';
  for (const [x, y, w, h] of [[60, 600, 70, 80], [220, 520, 80, 90], [400, 450, 70, 80], [1160, 600, 70, 80], [1000, 520, 80, 90], [820, 450, 70, 80]]) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h * 0.3); ctx.lineTo(x + w * 0.5, y + h); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(234,246,251,0.85)';
  for (const [x, y, len] of [[140, 500, 44], [360, 430, 38], [1140, 500, 44], [920, 430, 38]]) {
    ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.lineTo(x + 2, y + len); ctx.closePath(); ctx.fill();
  }
  // NEAR peaks: very close jagged ice peaks framing the bottom corners —
  // the "very close canyon below" the brief asks for
  const nearPeak = (x0, yTop, x1) => {
    ctx.beginPath(); ctx.moveTo(x0, 720); ctx.lineTo(x1, yTop); ctx.lineTo(x0 + (x1 - x0) * 2, 720); ctx.closePath();
    ctx.fillStyle = '#5B7FA0'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1 - 22, yTop + 34); ctx.lineTo(x1, yTop); ctx.lineTo(x1 + 22, yTop + 34); ctx.closePath();
    ctx.fillStyle = 'rgba(234,246,251,0.95)'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, 720); ctx.lineTo(x1, yTop); ctx.lineTo(x0 + (x1 - x0) * 2, 720); ctx.stroke();
  };
  nearPeak(-40, 560, 60); nearPeak(80, 500, 170); nearPeak(220, 540, 320);
  nearPeak(960, 540, 1060); nearPeak(1100, 500, 1190); nearPeak(1230, 560, 1330);
  // canyon floor: a lighter ice "river" band from the vanishing point
  // widening toward the viewer — gives the spine peaks a ground to sit
  // on instead of floating on the dark wall fill (pass 3).
  ctx.beginPath();
  ctx.moveTo(VPX - 26, VPY + 8); ctx.lineTo(VPX + 26, VPY + 8);
  ctx.lineTo(800, 720); ctx.lineTo(480, 720);
  ctx.closePath();
  ctx.fillStyle = '#6B8CAE'; ctx.fill();
  ctx.strokeStyle = 'rgba(28,25,23,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(VPX - 26, VPY + 8); ctx.lineTo(480, 720); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(VPX + 26, VPY + 8); ctx.lineTo(800, 720); ctx.stroke();
  // canyon-floor spine: sharp peaks receding to the vanishing point,
  // growing toward the viewer (perspective scale)
  const spine = [[0, 26, 18], [52, 44, 30], [118, 72, 48], [196, 108, 70], [288, 152, 96], [392, 210, 128], [480, 300, 150], [508, 280, 164]];
  for (let i = 0; i < spine.length; i++) {
    const [dy, w, h] = spine[i];
    const y = VPY + 14 + dy;
    ctx.beginPath();
    ctx.moveTo(VPX - w / 2, y); ctx.lineTo(VPX, y - h); ctx.lineTo(VPX + w / 2, y);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? '#3D5A78' : '#5B7FA0'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(VPX - w * 0.14, y - h + h * 0.32); ctx.lineTo(VPX, y - h); ctx.lineTo(VPX + w * 0.14, y - h + h * 0.32);
    ctx.closePath();
    ctx.fillStyle = 'rgba(234,246,251,0.92)'; ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  }
  // valley shadows where the walls meet the floor (softened pass 2 —
  // the hard triangles read as a shadow stripe, not a valley)
  ctx.fillStyle = 'rgba(11,17,32,0.22)';
  ctx.beginPath(); ctx.moveTo(500, 720); ctx.lineTo(580, 720); ctx.lineTo(640, 360); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(780, 720); ctx.lineTo(700, 720); ctx.lineTo(640, 360); ctx.closePath(); ctx.fill();
  // layered ice fog across the canyon floor (narrowed to the floor, pass 2)
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = 'rgba(234,246,251,' + (0.07 + i * 0.02).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(640, 500 + i * 80, 300 + i * 80, 16 + i * 5, 0, 0, Math.PI * 2); ctx.fill();
  }
}

export function drawStorm(ctx, g, world) {
  // Shot 3 v2.4: 3D CHASE-VIEW "Almost Stall + Lightning Near-Miss".
  // Over-the-shoulder camera behind-above the plane: the plane is centred
  // on the vanishing point at ~39% of the middle area's width, so 0% of
  // wings, tail or propellers is clipped by the side panels (the v2.3
  // rejection). Pure canvas-2D perspective — no WebGL/Three.js.
  // Far peaks suppressed (peaks: []) — the canyon is the terrain now.
  drawSky(ctx, g, { ...world, peaks: [] });
  if (g.chase25) {
    // v2.5: DARKER night storm sky — bright copper-gold + white ice must
    // pop instantly at 300px. Veil covers the sky band only; the second
    // aurora pass, rings, bolt and plane below stay full-bright.
    ctx.fillStyle = 'rgba(3,6,14,0.42)';
    ctx.fillRect(0, 0, 1280, 330);
  }
  drawAurora(ctx, g.t, g.sector, 1.6); // v2.1: sharper, thicker aurora glow
  // dark storm cloud masses framing the aurora gap above the horizon
  for (const [ccx, ccy, crx, cry] of [[180, 118, 230, 52], [1100, 108, 250, 58], [480, 78, 180, 38], [880, 62, 150, 32]]) {
    ctx.fillStyle = 'rgba(14,22,38,0.85)';
    ctx.beginPath(); ctx.ellipse(ccx, ccy, crx, cry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(60,80,110,0.5)';
    ctx.beginPath(); ctx.ellipse(ccx, ccy - 12, crx * 0.8, cry * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  }
  drawWindStreaks(ctx, g, 30); // v2.2: denser speed lines for the climax
  // v2.3: fast storm wind lines — v2.4 angles them diagonally down-left
  // so the gale reads as a crosswind shoving the plane off the gates.
  ctx.save();
  for (let i = 0; i < 18; i++) {
    const wy = 110 + ((i * 173 + 60) % 460);
    const wx = (i * 307 + 40) % 1280;
    ctx.strokeStyle = 'rgba(255,255,255,' + (0.30 + (i % 3) * 0.08).toFixed(2) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + 190, wy + 34); ctx.stroke();
  }
  ctx.restore();
  drawCanyon3D(ctx); // v2.4: perspective ice canyon, walls -> vanishing point
  if (g.chase25) {
    // v2.5: sharp jagged ice peaks raised RIGHT BELOW the diving left
    // wing (tip ~536,428) — as if metres from collision. Drawn in the
    // canyon pass, before the plane, so the wing overlaps them; bases
    // run behind the dialogue box (y 470), apexes stay visible above it.
    // v2.6: peak 2 (directly below the left wingtip) lowered 15px
    // (436→451) + the wing-ice rim light in art.js — the ice slab must
    // not merge with the peak at 300px. Gap wingtip→apex ~18px→~28px
    // diagonal; apex (451) stays 19px above the dialogue box (470).
    const threatPeak = (x0, ax, ay, x1) => {
      ctx.beginPath(); ctx.moveTo(x0, 560); ctx.lineTo(ax, ay); ctx.lineTo(x1, 560); ctx.closePath();
      ctx.fillStyle = '#5B7FA0'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x1, 560); ctx.lineTo(ax + (x1 - ax) * 0.4, 560); ctx.closePath();
      ctx.fillStyle = '#3D5A78'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(ax - 20, ay + 30); ctx.lineTo(ax, ay); ctx.lineTo(ax + 20, ay + 30); ctx.closePath();
      ctx.fillStyle = 'rgba(234,246,251,0.95)'; ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x0, 560); ctx.lineTo(ax, ay); ctx.lineTo(x1, 560); ctx.stroke();
    };
    threatPeak(420, 465, 448, 520);
    threatPeak(480, 520, 451, 580);
    threatPeak(555, 595, 450, 655);
  }
  // v2.4: 3 glowing green-cyan aurora gate rings in perspective, receding
  // to the right — nearly missed (gale drift). No duplicate AURORA LOCK
  // ×12 top centre (removed v2.2; bottom-right stamp only).
  // v2.5: GREEN-GOLD rings (gold outer, green inner) — v2.4's were green-cyan.
  for (const [gx, gy, gr] of [[850, 235, 46], [935, 205, 30], [1000, 182, 18]]) {
    ctx.save();
    ctx.shadowColor = g.chase25 ? '#F2B705' : '#10B981'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = g.chase25 ? '#F2B705' : '#10B981'; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(gx, gy, gr - 11, (gr - 11) * 0.82, 0, 0, Math.PI * 2);
    ctx.strokeStyle = g.chase25 ? '#10B981' : '#F2B705'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  // v2.4 (climax only): BRANCHING magenta-cyan bolt striking a few px
  // off the right wingtip (tip ~713,167; bolt passes x ~739 at that
  // height, ~13px clear). Flash glow in the dark cloud above. The bolt
  // passes behind the message banner (y 100–140), as the v2.3 bolt did.
  // v2.5: BRIGHT BRANCHING WHITE-CYAN bolt (no magenta) — the right
  // wingtip moved to ~(725,158) with the diagonal dive, so the bolt now
  // runs down x ~734 at that height (~12px clear) with a flash glow at
  // the wing edge. Cloud flash above; branches fork right, away from
  // the plane and the gate rings.
  if (g.climax) {
    const boltCols = g.chase25
      ? [['rgba(103,232,249,0.9)', 10], ['rgba(255,255,255,0.95)', 5], ['rgba(255,255,255,1)', 2]]
      : [['rgba(34,211,238,0.9)', 10], ['rgba(217,70,239,0.95)', 5], ['rgba(255,255,255,0.95)', 2]];
    const boltShadow = g.chase25 ? '#67E8F9' : '#D946EF';
    const flashCols = g.chase25
      ? ['rgba(255,255,255,0.6)', 'rgba(103,232,249,0.30)', 'rgba(103,232,249,0)']
      : ['rgba(255,255,255,0.55)', 'rgba(217,70,239,0.28)', 'rgba(217,70,239,0)'];
    const flash = ctx.createRadialGradient(772, 70, 4, 772, 70, 110);
    flash.addColorStop(0, flashCols[0]);
    flash.addColorStop(0.5, flashCols[1]);
    flash.addColorStop(1, flashCols[2]);
    ctx.fillStyle = flash;
    ctx.beginPath(); ctx.arc(772, 70, 110, 0, Math.PI * 2); ctx.fill();
    const boltTrace = (pts, colors) => {
      for (const [color, lw] of colors) {
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
        ctx.stroke();
      }
    };
    const main = g.chase25
      ? [[770, 60], [752, 96], [740, 122], [734, 150], [736, 178], [730, 206], [738, 240], [730, 276], [738, 310], [730, 344]]
      : [[772, 64], [756, 96], [744, 122], [738, 150], [740, 178], [732, 206], [742, 240], [730, 276], [738, 310], [730, 344]];
    ctx.save(); ctx.shadowColor = boltShadow; ctx.shadowBlur = 20;
    boltTrace(main, boltCols);
    ctx.restore();
    if (g.chase25) {
      // flash AT the wing edge — the near-miss reads as a strike about
      // to land on the right wingtip.
      const edge = ctx.createRadialGradient(732, 156, 2, 732, 156, 42);
      edge.addColorStop(0, 'rgba(255,255,255,0.85)');
      edge.addColorStop(0.5, 'rgba(103,232,249,0.35)');
      edge.addColorStop(1, 'rgba(103,232,249,0)');
      ctx.fillStyle = edge;
      ctx.beginPath(); ctx.arc(732, 156, 42, 0, Math.PI * 2); ctx.fill();
    }
    // branches fork right, away from the plane and the gate rings
    ctx.save(); ctx.shadowColor = boltShadow; ctx.shadowBlur = 10;
    if (g.chase25) {
      boltTrace([[740, 122], [768, 138], [796, 150]], [['rgba(103,232,249,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
      boltTrace([[736, 178], [764, 194], [792, 208]], [['rgba(103,232,249,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
      boltTrace([[730, 206], [754, 222], [778, 238]], [['rgba(103,232,249,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
    } else {
      boltTrace([[744, 122], [772, 138], [800, 150]], [['rgba(34,211,238,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
      boltTrace([[740, 178], [768, 194], [796, 208]], [['rgba(34,211,238,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
      boltTrace([[732, 206], [756, 222], [780, 238]], [['rgba(34,211,238,0.85)', 4], ['rgba(255,255,255,0.9)', 1.5]]);
    }
    ctx.restore();
    // distant bolt striking the canyon floor, far left (clear of the
    // [H] chip and both side panels)
    ctx.save(); ctx.shadowColor = boltShadow; ctx.shadowBlur = 8;
    boltTrace([[300, 380], [312, 420], [296, 460], [308, 500], [300, 540]], g.chase25
      ? [['rgba(103,232,249,0.7)', 4], ['rgba(255,255,255,0.8)', 1]]
      : [['rgba(34,211,238,0.7)', 4], ['rgba(217,70,239,0.7)', 2], ['rgba(255,255,255,0.8)', 1]]);
    ctx.restore();
  }
  // v2.4: the chase-view aircraft — centred (640, 305), banking 63°
  // (-1.10 rad), nose slightly up toward the vanishing point. Half-span
  // 160px (~39% of the 816px middle area): the lowest wingtip corner
  // clears the dialogue box (y 470) and nothing touches the side panels.
  // v2.5: DIAGONAL DIVING pose (dive25) — fuselage rotated 135° so the
  // nose + copper props point forward-down to the lower-right over dark
  // sky; wings keep a steep -55° tilt, crossing the fuselage at ~70°.
  // Centre (640, 300): right tip ~(725,158), left (iced) tip ~(536,428),
  // nose prop ~(684,344), tail ~(575,235) — 0% clipped by panels/box.
  drawChaseAircraft(ctx, 640, g.chase25 ? 300 : 305, -1.10, g.t, { crew: 3, mods: g.modules.map((m) => m.id), iced: true, storm: true, climax: true, dive25: !!g.chase25 });
  // v2.1: orange engine sparks from the propeller (deterministic, fixed
  // shot time) — v2.4 re-centred on the chase-view nose prop (640, 243).
  // v2.5: nose prop moved to (684, 344) with the diagonal dive.
  const [ncx, ncy] = g.chase25 ? [684, 344] : [640, 252];
  for (let i = 0; i < 10; i++) {
    const px = ncx + Math.sin(i * 2.7 + g.t * 3) * 52, py = ncy + Math.cos(i * 1.9 + g.t * 2) * 26;
    ctx.fillStyle = i % 2 ? '#FDBA74' : '#FDE68A';
    ctx.beginPath(); ctx.arc(px, py, i % 3 === 0 ? 3 : 2, 0, Math.PI * 2); ctx.fill();
  }
  // exhaust smoke puffs drifting below the tail (fade before y 470)
  // v2.5: tail moved to ~(575,235) — smoke trails up-left behind it.
  const smokePts = g.chase25
    ? [[566, 226], [556, 216], [548, 208], [540, 200]]
    : [[640, 430], [630, 440], [648, 448], [638, 456]];
  for (let i = 0; i < 4; i++) {
    const sx = smokePts[i][0], sy = smokePts[i][1];
    ctx.fillStyle = 'rgba(234,246,251,' + (0.5 - i * 0.1).toFixed(2) + ')';
    ctx.beginPath(); ctx.ellipse(sx, sy, 16 - i * 2, 7, 0, 0, Math.PI * 2); ctx.fill();
  }
  // v2.4: glowing [H] HEAT ACTIVE tag at the left wing root — orange heat
  // vs blue ice. Free sky below-left of the plane; leader line points at
  // the glowing wing-root melt zone (~620, 332).
  // v2.5: chip moved to (340,360) — clear of the diving left wing (tip
  // ~536,428) and of the canyon wall ridge; leader points at the iced
  // left wing near the root (615, 335).
  const [hx, hy] = g.chase25 ? [340, 360] : [400, 380];
  const [lx, ly] = g.chase25 ? [615, 335] : [620, 332];
  ctx.save();
  ctx.shadowColor = '#F97316'; ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(11,17,32,0.92)';
  ctx.fillRect(hx, hy, 172, 30);
  ctx.strokeStyle = '#F97316'; ctx.lineWidth = 2; ctx.strokeRect(hx, hy, 172, 30);
  ctx.restore();
  label(ctx, '[H] HEAT ACTIVE', hx + 86, hy + 20, 15, '#FB923C', 'center');
  ctx.save();
  ctx.strokeStyle = '#FB923C'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(hx + 172, hy + 15); ctx.lineTo(lx, ly); ctx.stroke();
  ctx.restore();
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
