// world.js — one job: seeded world generation (peaks, rings, aurora, snow).
import { mulberry32, SECTORS } from './config.js';

export function buildWorld(seed) {
  const rng = mulberry32(seed);
  const peaks = [];
  for (let i = 0; i < 46; i++) {
    peaks.push({ x: rng() * 5200, y: 340 + rng() * 260, w: 120 + rng() * 220, h: 60 + rng() * 150, shade: rng() });
  }
  const snow = [];
  for (let i = 0; i < 160; i++) snow.push({ x: rng(), y: rng(), s: 1 + rng() * 2.4, v: 20 + rng() * 60 });
  const bolts = [];
  for (let i = 0; i < 9; i++) bolts.push({ x: rng(), y: rng() * 0.5, ph: rng() * 6.28 });
  return { peaks, snow, bolts, rng };
}

// Ring gates for a sector: laid out ahead of the aircraft's flight path.
export function sectorRings(sectorId, seed) {
  const rng = mulberry32(seed * 31 + sectorId * 7);
  const sec = SECTORS[sectorId - 1];
  const rings = [];
  let x = 700, y = 330;
  for (let i = 0; i < sec.rings; i++) {
    x += 620 + rng() * 260;
    y = 180 + rng() * 320;
    rings.push({ x, y, r: 52, taken: false, idx: i, lock: 0 });
  }
  return rings;
}
export function ringAngle(px, py, ring) { return Math.atan2(ring.y - py, ring.x - px); }
export function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
