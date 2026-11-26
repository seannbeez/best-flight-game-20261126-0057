# STRATOSPHERE OBSERVATORY — Arctic Expedition Aircraft

[![best-flight-game-20261126-0057](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/c/best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/rank.svg)](https://make.fun/c/best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/reward.svg)](https://make.fun/c/best-flight-game-20261126-0057)

A 1928 Arctic expedition flight game for the [Make the best flight game](https://make.fun/c/best-flight-game-20261126-0057) bounty. Fly a twin-boom copper-bronze expedition aircraft through aurora storms over jagged ice peaks: thread glowing sector gates, manage fuel, wing heat and icing across three atmosphere layers, draft refit modules between sorties, and bring all six crew home for a Rank S expedition.

## The game

- **6 polar sectors** × **4 mission modes** (Survey, Rescue, Sample, Storm Run), each with its own goal and briefing.
- **6 specialist crew** (leader, navigator, meteorologist, mechanic, radio operator, surgeon) with branch missions and in-cabin dialogue.
- **18 synergising aircraft modules** in 4 sets (Thermal / Airframe / Fuel / Science) — a 3-card **PICK 1 OF 3** refit draft between sorties.
- **14 atmospheric phenomena** (Magnetic Gale, Aurora Curtain, Whiteout, St. Elmo's Fire…), **12 crew events**, **20 Expedition Feats**.
- **3 atmosphere layers** (Lower Ice Layer, Middle Jet Stream, Aurora Stratosphere) — freeze vs. overheat tension: wing heat, fuel trim and de-icing are real decisions.
- Full HUD: ALT / SPD / HDG numerals, fuel manometer, artificial horizon & compass, wing temperature, Aurora Lock stamp, sector tracker, crew roster.
- Procedural Web Audio engine hum + wind (M to mute), pause (P), deterministic `?shot=` states, `?auto=1` autopilot, `window.__game` probe.

## Controls

| Key | Action |
| --- | --- |
| Enter | Start / fly again |
| Arrows / WASD | Steer (left/right) · throttle (up/down) |
| H | Wing heat (hold) |
| 1 / 2 / 3 | Climb / dive atmosphere layer · pick a refit card |
| M | Mute · P pause |

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

No network calls, no external assets — everything is drawn in code on a layered 2D canvas. Screenshots in `screenshots/` are real renders of the game's own code (`?shot=play|refit|storm|logbook&seed=1`).

## Files

- `game/index.html` — entry page
- `game/src/config.js` — data tables (sectors, crew, modules, phenomena, feats, events)
- `game/src/flight.js` — flight model, fuel/heat/damage, rings, autopilot
- `game/src/world.js` — seeded world generation (peaks, gates, snow)
- `game/src/art.js` — inked drawing primitives + aircraft, aurora, crew portraits
- `game/src/render.js` — screen renderers (title / play / refit / storm / logbook)
- `game/src/hud.js` — HUD panels, instruments, matrix boxes
- `game/src/audio.js` — procedural Web Audio
- `game/src/input.js` — keyboard input
- `game/src/shots.js` — deterministic `?shot=` states
- `game/src/main.js` — boot + game loop + `window.__game` probe

MIT licence. Built for the make.fun bounty `best-flight-game-20261126-0057`.
