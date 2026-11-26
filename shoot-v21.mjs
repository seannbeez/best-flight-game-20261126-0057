// Playwright harness for cand-a-v21: 4 deterministic ?shot= screenshots,
// determinism check, live autopilot + manual keyboard play-through.
// Serves THIS candidate's own game/ — the probe below asserts the page
// under test is served from our own port (never another candidate's).
// Usage: node shoot-v21.mjs <cand-dir> <port>
// (start `node serve.ts --port <port>` in the cand dir first)
import { chromium } from 'playwright-core';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CAND = process.argv[2];
const PORT = process.argv[3] || '8087';
const SHOTS = join(CAND, 'screenshots');
const EXE = '/home/hatch/workspace/makefun/best-game-01-tests/pw/chrome-linux64/chrome';
const BASE = `http://localhost:${PORT}/index.html`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const problems = [];
const requests = [];
page.on('console', (m) => { if (m.type() === 'error') { problems.push('[console.error] ' + m.text()); console.log('CONSOLE ERROR:', m.text()); } });
page.on('pageerror', (e) => { problems.push('pageerror: ' + e.message); console.log('PAGEERROR:', e.message); });
page.on('requestfailed', (r) => { problems.push('reqfailed: ' + r.url()); console.log('REQFAILED:', r.url()); });
page.on('request', (r) => requests.push(r.url()));

async function probeOwnServer() {
  const info = await page.evaluate(() => ({
    href: location.href,
    hasGame: Boolean(window.__game),
    screen: window.__game ? window.__game.g.screen : null,
    title: document.title,
  }));
  console.log('probe:', JSON.stringify(info));
  if (!info.href.startsWith(`http://localhost:${PORT}/`)) { problems.push('WRONG SERVER: ' + info.href); }
  if (!info.hasGame) problems.push('no window.__game probe on ' + info.href);
  return info;
}

const demos = [['start', '1-play.jpg', 'title'], ['refit', '2-refit.jpg', 'refit'], ['storm', '3-storm.jpg', 'play'], ['logbook', '4-logbook.jpg', 'logbook']];
for (const [shot, file, wantScreen] of demos) {
  await page.goto(`${BASE}?shot=${shot}&seed=1`, { waitUntil: 'load' });
  await sleep(700);
  const info = await probeOwnServer();
  if (info.screen !== wantScreen) problems.push(`shot=${shot}: screen ${info.screen} != ${wantScreen}`);
  await page.screenshot({ path: join(SHOTS, file), type: 'jpeg', quality: 82 });
  console.log('shot', shot, '->', file, 'screen=', info.screen);
}
const hashes = [];
for (let i = 0; i < 2; i += 1) {
  await page.goto(`${BASE}?shot=play&seed=1`, { waitUntil: 'load' });
  await sleep(500);
  const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
  hashes.push(createHash('sha256').update(buf).digest('hex'));
}
console.log('determinism play:', hashes[0] === hashes[1] ? 'IDENTICAL' : 'DIFFER ' + hashes[0].slice(0, 12) + ' vs ' + hashes[1].slice(0, 12));
if (hashes[0] !== hashes[1]) problems.push('non-deterministic play shot');

// autopilot: must clear sector 1
await page.goto(BASE + '?auto=1', { waitUntil: 'load' });
await sleep(800);
let st = await page.evaluate(() => window.__game.g.screen);
console.log('auto screen after load:', st);
for (let i = 0; i < 12; i++) {
  await sleep(5000);
  st = await page.evaluate(() => ({ screen: window.__game.g.screen, sector: window.__game.g.sector, rings: window.__game.g.ringIdx + '/' + window.__game.g.rings.length, fuel: Math.round(window.__game.g.fuel), score: window.__game.g.score, cleared1: window.__game.g.clearedSector1, x: Math.round(window.__game.g.px) }));
  console.log('auto t+' + ((i + 1) * 5) + 's:', JSON.stringify(st));
  if (st.cleared1) break;
}
if (!st.cleared1) problems.push('autopilot did NOT clear sector 1');
await page.screenshot({ path: join(CAND, 'live-auto.jpg'), type: 'jpeg', quality: 82 });

// manual keyboard test
await page.goto(BASE, { waitUntil: 'load' });
await sleep(800);
await page.keyboard.press('Enter');
await sleep(600);
await page.keyboard.down('ArrowRight'); await sleep(600); await page.keyboard.up('ArrowRight');
await page.keyboard.down('ArrowUp'); await sleep(500); await page.keyboard.up('ArrowUp');
await page.keyboard.down('KeyH'); await sleep(400); await page.keyboard.up('KeyH');
st = await page.evaluate(() => ({ screen: window.__game.g.screen, heading: +window.__game.g.heading.toFixed(2), speed: Math.round(window.__game.g.speed), throttle: +window.__game.g.throttle.toFixed(2), wingTemp: Math.round(window.__game.g.wingTemp) }));
console.log('manual:', JSON.stringify(st));
if (st.screen !== 'play') problems.push('manual Enter did not reach play screen: ' + st.screen);
await page.screenshot({ path: join(CAND, 'live-manual.jpg'), type: 'jpeg', quality: 82 });

const external = requests.filter((u) => !u.startsWith('http://localhost:' + PORT));
console.log('total requests:', requests.length, '| external:', external.length);
if (external.length) problems.push('external: ' + external.join(','));
await browser.close();
if (problems.length) { console.error('PROBLEMS (' + problems.length + '):'); for (const p of problems) console.error(' - ' + p); process.exit(1); }
console.log('SHOOT OK — no console errors, no page errors, no external requests');
