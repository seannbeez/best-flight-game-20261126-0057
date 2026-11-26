// input.js — one job: keyboard input state.
export function createInput() {
  const input = {
    up: false, down: false, left: false, right: false,
    heat: false, altUp: false, altDown: false,
    enter: false, mute: false, pause: false, keys: {},
  };
  const map = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyH: 'heat' };
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') input.enter = true;
    if (e.code === 'KeyM') input.mute = true;
    if (e.code === 'KeyP' || e.code === 'Escape') input.pause = true;
    if (e.code === 'Digit1') input.altDown = true;
    if (e.code === 'Digit2') input.altUp = true;
    if (e.code === 'Digit3') input.altUp = true;
    if (map[e.code]) { input[map[e.code]] = true; input.keys[e.code] = true; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (map[e.code]) { input[map[e.code]] = false; input.keys[e.code] = false; }
  });
  input.consume = function () {
    const s = { enter: input.enter, mute: input.mute, pause: input.pause };
    input.enter = false; input.mute = false; input.pause = false;
    return s;
  };
  return input;
}
