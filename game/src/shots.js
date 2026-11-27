// shots.js — one job: deterministic ?shot= states (fixed seed + fixed time).
import { newGame, startSortie } from './flight.js';
import { MODULES } from './config.js';

export function applyShot(g, shot, seed) {
  g.t = 0;
  if (shot === 'play') {
    g.screen = 'play';
    g.sector = 1;
    startSortie(g);
    g.t = 2.4;
    g.px = 900; g.py = 320; g.heading = 0.05; g.speed = 210; g.throttle = 0.7;
    g.fuel = 78; g.wingTemp = 58; g.ice = 8; g.score = 1450; g.combo = 2;
    g.rings[0].taken = true; g.ringIdx = 1;
    g.message = 'RING 1 — +250  (combo ×2)'; g.msgT = 10;
    g.dialogue = 0; g.dialogueT = 10;
  } else if (shot === 'refit') {
    g.screen = 'refit';
    g.sector = 2; g.score = 2350; g.sorties = 1;
    g.modules = [MODULES[0]];
    g.draft = [MODULES[0], MODULES[1], MODULES[2]];
    g.draft = [MODULES[1], MODULES[2], MODULES[3]];
    g.t = 1.0;
  } else if (shot === 'storm') {
    g.sector = 3;
    startSortie(g);
    g.screen = 'play'; g.storm = true;
    // v2.1 Fix 3: the 3 refit cards' modules are installed, so they must
    // be VISIBLE on the aircraft (glowing twin tail, heated prop, tank).
    g.modules = [MODULES[1], MODULES[2], MODULES[3]];
    g.t = 3.1;
    g.px = 1000; g.py = 300; g.heading = -0.12; g.speed = 240; g.throttle = 0.85;
    // v2.4 (chase view): peak emergency — 8 GAL fuel, wing 84% iced,
    // throttle 96%, banking 63°. chase24 suppresses the v2.3 climax
    // bolts in drawSnow (the near-miss bolt is drawn in drawStorm).
    // v2.5: chase25 — diagonal diving pose, darker sky, 75% wing ice,
    // white-cyan bolt, green-gold rings, threat peaks below left wing.
    g.fuel = 8; g.wingTemp = -12; g.ice = 84; g.score = 3120; g.combo = 3; g.climax = true; g.chase24 = true; g.chase25 = true;
    g.throttle = 0.96;
    g.rings[0].taken = true; g.ringIdx = 1;
    g.message = 'MAGNETIC GALE — hold the gates!'; g.msgT = 10;
    g.dialogue = 2; g.dialogueT = 10;
  } else if (shot === 'start') {
    // v2.1: the full-bleed title poster is its own deterministic state,
    // distinct from gameplay (?shot=play). Cover shot 1-play.jpg.
    g.screen = 'title'; g.t = 1.6;
  } else if (shot === 'logbook') {
    g.screen = 'logbook'; g.victory = true; g.rank = 'S';
    g.score = 6840; g.sorties = 6; g.sector = 6; g.ringIdx = 23;
    g.feats = ['FIRST LIGHT', 'RING RUNNER', 'GALE TAMER', 'ICE BREAKER', 'AURORA SCOUT', 'STEADY HANDS', 'FUEL MISER', 'STORM RIDER', 'PEAK DANCER', 'SAMPLE MASTER', 'NIGHT OWL', 'COMPASS TRUE'];
    g.modules = MODULES.slice(0, 6);
    g.t = 1.0;
  } else {
    g.screen = 'title'; g.t = 1.6;
  }
  return g;
}
