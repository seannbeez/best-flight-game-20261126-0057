// main.js — one job: boot, game loop, screen state machine, window.__game probe.
import { W, H } from './config.js';
import { newGame, updateFlight, autopilot, pickDraft, startSortie, gradeRank } from './flight.js';
import { buildWorld } from './world.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { applyShot } from './shots.js';
import { drawTitle, drawPlay, drawRefit, drawStorm, drawLogbook, drawOver } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') || 1);
const shot = params.get('shot');
const auto = params.get('auto') === '1';

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = '100vw'; canvas.style.height = '100vh';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const g = newGame(seed);
g.auto = auto;
const world = buildWorld(seed);
const audio = createAudio();
const input = createInput();
if (shot) applyShot(g, shot, seed);
else g.screen = 'title';

let last = performance.now();
let shotFrozen = Boolean(shot);
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const ev = input.consume();
  if (ev.mute) { g.muted = audio.toggleMute(); }
  if (ev.pause && (g.screen === 'play')) g.paused = !g.paused;
  if (!shotFrozen) {
    g.t += 0; // t advances inside updateFlight for play; title anim uses its own clock
    if (g.screen === 'title' || g.screen === 'logbook' || g.screen === 'over' || g.screen === 'refit') g.t += dt;
    if (g.auto && g.screen === 'title') { audio.ensure(); startSortie(g); }
    if (g.auto && g.screen === 'play') autopilot(g, input);
    if (ev.enter) {
      audio.ensure();
      if (g.screen === 'title') startSortie(g);
      else if (g.screen === 'over' || g.screen === 'logbook') { const ng = newGame(seed); Object.assign(g, ng); g.auto = auto; startSortie(g); }
    }
    if (g.screen === 'refit') {
      if (input.keys['Digit1']) pickDraft(g, 0);
      else if (input.keys['Digit2']) pickDraft(g, 1);
      else if (input.keys['Digit3']) pickDraft(g, 2);
    }
    updateFlight(g, dt, input);
    if (g.screen === 'play') audio.setEngine(g.throttle, g.speed);
    g.rank = g.victory ? 'S' : gradeRank(g);
  }
  // render — letterboxed to 1280x720 logical
  const scale = Math.min(canvas.width / (window.devicePixelRatio || 1) / W, canvas.height / (window.devicePixelRatio || 1) / H);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0B1120'; ctx.fillRect(0, 0, W, H);
  if (g.screen === 'title') drawTitle(ctx, g, world);
  else if (g.screen === 'play') { if (g.storm) drawStorm(ctx, g, world); else drawPlay(ctx, g, world); }
  else if (g.screen === 'refit') drawRefit(ctx, g);
  else if (g.screen === 'logbook') drawLogbook(ctx, g);
  else if (g.screen === 'over') drawOver(ctx, g, world);
  ctx.restore();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Probe handle for play-tests.
window.__game = {
  g, world,
  screen: () => g.screen,
  score: () => g.score,
  rings: () => g.rings.filter((r) => r.taken).length,
  fuel: () => Math.round(g.fuel),
  altitude: () => g.altitude,
  sector: () => g.sector,
  clearedSector1: () => g.clearedSector1,
};
