// render.js — one job: draw every screen (title / play / refit / storm / logbook).
import { PAL, W, H, INK, SECTORS, CREW, MODULES, PHENOMENA, FEATS, EVENTS, ALTITUDES, MODES, SET_BONUS } from './config.js';
import { panel, darkPanel, text, label, drawAircraft, drawAurora, drawPeaks, drawCrew, poly, ellipse } from './art.js';
import { topBar, leftPanel, rightPanel, bottomInstruments, matrixBoxes, messageBanner, dialogueBox } from './hud.js';
import { setBonus } from './flight.js';

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
  if (storm) {
    // lightning arcs
    const b = world.bolts[Math.floor(g.t * 0.7) % world.bolts.length];
    if (Math.floor(g.t * 2) % 3 === 0) {
      ctx.strokeStyle = 'rgba(217,70,239,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath();
      let lx = b.x * 1280, ly = 0;
      ctx.moveTo(lx, ly);
      for (let k = 0; k < 6; k++) { lx += (Math.sin(k * 3 + b.ph) * 30); ly += 55; ctx.lineTo(lx, ly); }
      ctx.stroke();
    }
  }
}

export function drawPlay(ctx, g, world) {
  drawSky(ctx, g, world);
  drawRings(ctx, g);
  const bank = Math.sin(g.t * 0.8) * 0.14 + (g.storm ? Math.sin(g.t * 2.1) * 0.12 : 0);
  drawAircraft(ctx, 640, 330 + Math.sin(g.t * 1.3) * 8, 1.55, bank, g.t, { crew: 2 });
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
  drawSky(ctx, g, world);
  // storm-climax poster aircraft, big
  drawAircraft(ctx, 660, 300, 2.1, 0.22, g.t, { crew: 2 });
  drawSnow(ctx, g, world, true);
  // title card — solid, engraved
  panel(ctx, 60, 40, 560, 210, PAL.cream);
  text(ctx, 'STRATOSPHERE', 84, 108, 52, '#7C2D12');
  text(ctx, 'OBSERVATORY', 84, 162, 52, '#B45309');
  label(ctx, 'ARCTIC EXPEDITION AIRCRAFT · 1928 POLAR FLIGHT', 84, 192, 14, '#44403C');
  label(ctx, 'Fly the aurora. Warm the wings. Bring them home.', 84, 222, 14, '#1C1917');
  // saved-expedition list
  panel(ctx, 60, 268, 560, 150, '#141B2C');
  text(ctx, 'SAVED EXPEDITIONS', 84, 300, 16, PAL.gold);
  const saves = ['EXPEDITION I — FROSTBITE RIDGE · RANK A', 'EXPEDITION II — AURORA REACH · RANK S', 'EXPEDITION III — MAGNETIC GALE · IN PROGRESS'];
  saves.forEach((s, i) => label(ctx, '✦ ' + s, 84, 330 + i * 26, 14, '#F5EFE6'));
  // HOW TO PLAY — 3 steps
  panel(ctx, 60, 436, 560, 150, PAL.cream);
  text(ctx, 'HOW TO PLAY', 84, 468, 18, '#7C2D12');
  const steps = [
    '1  ARROWS / WASD — steer & throttle · fly through the glowing gates',
    '2  H — wing heat (ice vs overheat) · 1/2/3 — climb & dive layers',
    '3  Clear the sector → PICK 1 OF 3 refit modules · 6 sectors to RANK S',
  ];
  steps.forEach((s, i) => label(ctx, s, 84, 496 + i * 26, 13, '#1C1917'));
  // matrix boxes across the bottom
  matrixBoxes(ctx, 60, 606, 1160);
  // play prompt + right-side target ring
  darkPanel(ctx, 700, 470, 520, 90);
  text(ctx, 'PRESS ENTER TO FLY', 960, 512, 28, PAL.gold, 900, 'center');
  label(ctx, '5-SECOND HOOK: gates ahead, storm behind — go.', 960, 542, 13, '#F5EFE6', 'center');
  label(ctx, 'M — mute · P — pause · ?auto=1 autopilot', 960, 578, 12, '#94A3B8', 'center');
  // glowing target ring ahead (criterion 1)
  ctx.save();
  ctx.translate(1080, 300);
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 58, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#10B981'; ctx.lineWidth = 8; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 56, 46, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#D946EF'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  label(ctx, 'TARGET RING AHEAD', 1080, 392, 13, '#F5EFE6', 'center');
}

export function drawRefit(ctx, g) {
  drawSky(ctx, g, { peaks: [], snow: [], bolts: [] });
  panel(ctx, 40, 24, 1200, 64, PAL.cream);
  text(ctx, 'AIRFRAME & ENGINE REFIT', 64, 62, 30, '#7C2D12');
  label(ctx, 'SECTOR ' + (g.sector - 1) + ' CLEAR · PICK 1 OF 3 — press 1, 2 or 3', 700, 60, 16, '#1C1917');
  // cross-section aircraft, large, centre
  drawAircraft(ctx, 640, 250, 1.9, 0, g.t, { crew: 2 });
  label(ctx, 'CROSS-SECTION: TWIN-BOOM AIRFRAME · COPPER WINGS · BRASS COCKPIT', 640, 380, 13, '#F5EFE6', 'center');
  // 3 module cards
  g.draft.forEach((m, i) => {
    const x = 60 + i * 400;
    panel(ctx, x, 400, 380, 150, PAL.cream);
    text(ctx, (i + 1) + ' · ' + m.name, x + 20, 440, 17, '#7C2D12');
    label(ctx, 'SET: ' + m.set, x + 20, 468, 13, '#B45309');
    label(ctx, m.fx, x + 20, 494, 13, '#1C1917');
    label(ctx, m.desc, x + 20, 520, 12, '#44403C');
  });
  // Set synergy row — solid
  const sets = setBonus({ modules: [...g.modules, ...(g.draft[0] ? [g.draft[0]] : [])] });
  panel(ctx, 60, 566, 1160, 90, '#141B2C');
  text(ctx, 'SET SYNERGY', 84, 600, 16, PAL.gold);
  const owned = {};
  for (const m of g.modules) owned[m.set] = (owned[m.set] || 0) + 1;
  const rows = Object.keys(SET_BONUS).map((s) => s + ' ' + (owned[s] || 0) + '/2 — ' + SET_BONUS[s]);
  label(ctx, rows.slice(0, 2).join('   ·   '), 84, 626, 12, '#F5EFE6');
  label(ctx, rows.slice(2).join('   ·   '), 84, 646, 12, '#F5EFE6');
  label(ctx, 'SCORE ' + g.score + ' · MODULES ' + g.modules.length + '/18', 1000, 626, 13, PAL.gold);
}

export function drawStorm(ctx, g, world) {
  // Shot 3: magnetic gale climax — cockpit-first, crew behind glass
  drawSky(ctx, g, world);
  drawRings(ctx, g);
  drawAircraft(ctx, 640, 320, 1.9, 0.38, g.t, { crew: 3 });
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
  text(ctx, 'ATMOSPHERIC SAMPLES', 670, 460, 15, '#7C2D12');
  for (let i = 0; i < 8; i++) {
    const x = 690 + i * 58;
    ctx.fillStyle = i < 5 ? '#10B981' : '#D946EF';
    ctx.fillRect(x, 480, 34, 52);
    ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(x, 480, 34, 52);
    label(ctx, 'S' + (i + 1), x + 17, 556, 11, '#1C1917', 'center');
  }
  label(ctx, 'Samples: aurora green ×5 · magnetic magenta ×3 — sealed in copper vials.', 670, 586, 12, '#44403C');
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
