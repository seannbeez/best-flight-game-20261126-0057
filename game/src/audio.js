// audio.js — one job: procedural Web Audio (engine hum, wind, chimes) + mute.
export function createAudio() {
  const a = { ctx: null, muted: false, engine: null, engineGain: null, windGain: null };
  a.ensure = function () {
    if (a.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      a.ctx = new AC();
      const o = a.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55;
      const o2 = a.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110;
      a.engineGain = a.ctx.createGain(); a.engineGain.gain.value = 0.0;
      o.connect(a.engineGain); o2.connect(a.engineGain); a.engineGain.connect(a.ctx.destination);
      o.start(); o2.start();
      a.engine = o;
      const buf = a.ctx.createBuffer(1, a.ctx.sampleRate * 2, a.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = a.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = a.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 400;
      a.windGain = a.ctx.createGain(); a.windGain.gain.value = 0.0;
      src.connect(f); f.connect(a.windGain); a.windGain.connect(a.ctx.destination);
      src.start();
    } catch (e) { /* audio unavailable — game still plays */ }
  };
  a.setEngine = function (throttle, speed) {
    if (!a.ctx || a.muted) return;
    const t = a.ctx.currentTime;
    a.engineGain.gain.setTargetAtTime(0.03 + throttle * 0.05, t, 0.1);
    if (a.engine) a.engine.frequency.setTargetAtTime(45 + throttle * 60, t, 0.1);
    a.windGain.gain.setTargetAtTime(0.01 + speed / 9000, t, 0.2);
  };
  a.chime = function (freq = 880) {
    if (!a.ctx || a.muted) return;
    const o = a.ctx.createOscillator(); const gn = a.ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    gn.gain.setValueAtTime(0.15, a.ctx.currentTime);
    gn.gain.exponentialRampToValueAtTime(0.001, a.ctx.currentTime + 0.5);
    o.connect(gn); gn.connect(a.ctx.destination);
    o.start(); o.stop(a.ctx.currentTime + 0.5);
  };
  a.toggleMute = function () {
    a.muted = !a.muted;
    if (a.ctx) { a.engineGain.gain.value = 0; a.windGain.gain.value = 0; }
    return a.muted;
  };
  return a;
}
