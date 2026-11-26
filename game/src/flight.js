// flight.js — one job: flight model, fuel/heat/damage, rings, feats, autopilot.
import { SECTORS, MODULES, PHENOMENA, FEATS, ALTITUDES } from './config.js';
import { sectorRings, angDiff, ringAngle } from './world.js';

export function newGame(seed = 1) {
  return {
    seed, screen: 'title', t: 0, paused: false, muted: false,
    sector: 1, mode: SECTORS[0].mode, altitude: 1,
    px: 120, py: 330, heading: 0, speed: 0, throttle: 0.55,
    fuel: 100, fuelMax: 100, hull: 100, wingTemp: 42, ice: 0,
    score: 0, rings: sectorRings(1, seed), ringIdx: 0, samples: 0,
    modules: [], draft: [], draftPicked: -1, feats: [], eventsSeen: [],
    message: '', msgT: 0, eventText: '', eventT: 0, combo: 0,
    sectorScore: 0, sorties: 0, damageTaken: 0, fuelUsed: 0,
    victory: false, defeat: false, rank: '—', beaconHold: 0,
    dialogue: 0, dialogueT: 0, phenActive: 0, auroraLock: 0,
    auto: false, clearedSector1: false, storm: false,
  };
}
export function hasModule(g, id) { return g.modules.some((m) => m.id === id); }
export function setBonus(g) {
  const counts = {};
  for (const m of g.modules) counts[m.set] = (counts[m.set] || 0) + 1;
  return Object.keys(counts).filter((s) => counts[s] >= 2);
}
export function turnRate(g) {
  let r = 1.9 * (hasModule(g, 'twin-tail') ? 1.35 : 1);
  if (setBonus(g).includes('AIRFRAME')) r *= 1.15;
  return r;
}
export function startSortie(g) {
  g.screen = 'play';
  g.mode = SECTORS[g.sector - 1].mode;
  g.sectorScore = 0; g.ringIdx = 0; g.beaconHold = 0;
  g.rings = sectorRings(g.sector, g.seed + g.sector);
  g.px = 120; g.py = 330; g.heading = 0; g.speed = 60; g.throttle = 0.55;
  g.fuel = g.fuelMax; g.ice = 0; g.wingTemp = 42;
  g.phenActive = SECTORS[g.sector - 1].phen[(g.seed + g.sector) % 3];
  g.message = SECTORS[g.sector - 1].name + ' — ' + SECTORS[g.sector - 1].brief;
  g.msgT = 4;
  g.storm = g.sector === 3 || g.sector === 6;
}
export function awardFeat(g, name) {
  if (!g.feats.includes(name)) { g.feats.push(name); g.score += 150; }
}
export function updateFlight(g, dt, input) {
  if (g.screen !== 'play' || g.paused) return;
  g.t += dt;
  // throttle
  if (input.up) g.throttle = Math.min(1, g.throttle + dt * 0.6);
  if (input.down) g.throttle = Math.max(0.15, g.throttle - dt * 0.6);
  const cruise = 0.55;
  // turn discipline: turning bleeds a little speed, rewarded by combo
  const turn = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  g.heading += turn * turnRate(g) * dt * (0.55 + g.speed / 320);
  const targetSpeed = 60 + g.throttle * 260 + (g.altitude === 1 ? 40 : 0);
  g.speed += (targetSpeed - g.speed) * dt * 0.8;
  g.px += Math.cos(g.heading) * g.speed * dt;
  g.py += Math.sin(g.heading) * g.speed * dt * 0.9;
  g.py = Math.max(90, Math.min(560, g.py));
  // altitude layers: W/S cycle? use 1/2/3 keys via input.alt
  if (input.altUp) { g.altitude = Math.min(2, g.altitude + 1); input.altUp = false; g.message = ALTITUDES[g.altitude].name + ' — ' + ALTITUDES[g.altitude].desc; g.msgT = 3; }
  if (input.altDown) { g.altitude = Math.max(0, g.altitude - 1); input.altDown = false; g.message = ALTITUDES[g.altitude].name + ' — ' + ALTITUDES[g.altitude].desc; g.msgT = 3; }
  // fuel burn
  let burn = (0.9 + g.throttle * 2.4) * dt;
  if (hasModule(g, 'efficient-cruise') && Math.abs(g.throttle - cruise) < 0.1) burn *= 0.8;
  if (setBonus(g).includes('FUEL')) burn *= 0.9;
  g.fuel = Math.max(0, g.fuel - burn);
  g.fuelUsed += burn;
  // wing heat: freeze vs overheat tension
  const ambient = ALTITUDES[g.altitude].temp;
  let heatRate = (input.heat ? 9 : -2) + (g.throttle - 0.55) * 8 + (ambient + 45) * 0.12;
  if (hasModule(g, 'wing-heat')) heatRate += input.heat ? 5 : 0;
  if (hasModule(g, 'boiler-boost') && input.heat) heatRate *= 2;
  g.wingTemp += heatRate * dt;
  const cap = hasModule(g, 'boiler-boost') ? 115 : 100;
  if (g.wingTemp > cap) { g.wingTemp = cap; g.hull -= 4 * dt; g.damageTaken += 4 * dt; g.message = 'OVERHEAT! Ease off the wing heat!'; g.msgT = 1; }
  if (g.wingTemp < 5) { g.ice += 6 * dt; g.message = 'WINGS ICING UP — press H for wing heat!'; g.msgT = 1; }
  else g.ice = Math.max(0, g.ice - (input.heat ? 8 : 1.5) * dt);
  if (hasModule(g, 'de-ice-boots') && Math.floor(g.t) % 10 === 0) g.ice = 0;
  if (g.ice > 60) { g.speed *= (1 - 0.3 * dt); g.heading += 0.25 * dt; }
  // storm drift
  if (g.storm) { g.heading += Math.sin(g.t * 0.7) * 0.12 * dt * (hasModule(g, 'twin-tail') ? 0.7 : 1); }
  // rings
  const ring = g.rings[g.ringIdx];
  if (ring && !ring.taken) {
    const dx = ring.x - g.px, dy = ring.y - g.py;
    const d = Math.hypot(dx, dy);
    if (d < ring.r + 26) {
      ring.taken = true; g.ringIdx++; g.combo++;
      const base = 200 + g.combo * 50;
      const mult = (g.altitude === 2 ? 2 : 1) * (hasModule(g, 'aurora-scoop') ? 2 : 1);
      const pts = base * mult;
      g.score += pts; g.sectorScore += pts; g.samples += (g.mode === 'sample' ? 1 : 0);
      if (hasModule(g, 'jet-intake')) g.fuel = Math.min(g.fuelMax, g.fuel + 4);
      g.message = 'RING ' + (ring.idx + 1) + ' — +' + pts + '  (combo ×' + g.combo + ')';
      g.msgT = 2.5;
      if (g.combo >= 3) awardFeat(g, 'THREE RINGS');
      if (g.ringIdx >= g.rings.length) sectorCleared(g);
    }
  }
  // random event every ~18s
  if (g.t > 0 && Math.floor(g.t) % 18 === 0 && g.eventT <= 0) {
    const ev = (window.__EVENTS__ || [])[0];
  }
  if (g.eventT > 0) g.eventT -= dt;
  if (g.msgT > 0) g.msgT -= dt;
  if (g.dialogueT > 0) g.dialogueT -= dt;
  // defeat
  if (g.fuel <= 0 || g.hull <= 0) {
    g.defeat = true; g.screen = 'over'; g.rank = 'D';
    g.message = g.fuel <= 0 ? 'OUT OF FUEL over the ice.' : 'AIRFRAME FAILURE.';
  }
}
function sectorCleared(g) {
  g.sorties++;
  awardFeat(g, 'RING RUNNER');
  if (g.hull >= 100) awardFeat(g, 'ZERO DAMAGE');
  if (g.sector === 1) g.clearedSector1 = true;
  const bonus = 300 + g.sector * 100;
  g.score += bonus; g.sectorScore += bonus;
  if (g.sector >= 6) {
    g.victory = true; g.screen = 'logbook'; g.rank = 'S';
    awardFeat(g, 'RANK S PILOT');
    return;
  }
  g.sector++;
  g.mode = SECTORS[g.sector - 1].mode;
  // 3-card refit draft
  const rngPool = MODULES.filter((m) => !hasModule(g, m.id));
  const picks = [];
  const used = new Set();
  while (picks.length < 3 && picks.length < rngPool.length) {
    const i = Math.floor(Math.random() * rngPool.length);
    if (!used.has(i)) { used.add(i); picks.push(rngPool[i]); }
  }
  g.draft = picks; g.draftPicked = -1; g.screen = 'refit';
}
export function pickDraft(g, idx) {
  if (g.screen !== 'refit' || idx < 0 || idx >= g.draft.length) return;
  g.modules.push(g.draft[idx]); g.draftPicked = idx;
  g.score += 100;
  startSortie(g);
}
// Autopilot: genuinely plays — steers to next ring, manages throttle + heat.
export function autopilot(g, input) {
  const ring = g.rings[g.ringIdx];
  input.up = false; input.down = false; input.left = false; input.right = false;
  input.heat = g.wingTemp < 30 || g.ice > 15;
  if (!ring) return;
  const want = ringAngle(g.px, g.py, ring);
  const diff = angDiff(want, g.heading);
  if (diff > 0.12) input.right = true;
  else if (diff < -0.12) input.left = true;
  const d = Math.hypot(ring.x - g.px, ring.y - g.py);
  if (d > 500) input.up = true;
  else if (d < 180) input.down = true;
  if (g.py < 130) input.right = false;
}
export function gradeRank(g) {
  if (g.score >= 6000) return 'S';
  if (g.score >= 4000) return 'A';
  if (g.score >= 2500) return 'B';
  return 'C';
}
