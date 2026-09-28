import { createPersistedStore } from './store.js';

export const soundStore = createPersistedStore('tz:sound', true);

let ctx = null;

function audio() {
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    return null;
  }
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (navigator.audioSession) navigator.audioSession.type = 'ambient';
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq, to, dur, type = 'sine', gain = 0.06, delay = 0 }) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

let white = null;

function noise({ dur, gain = 0.05, freq = 3000, q = 1.2, delay = 0 }) {
  const c = audio();
  if (!c) return;
  if (!white) {
    white = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = white.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = white;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const amp = c.createGain();
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.003);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(amp).connect(c.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

const play =
  (fn) =>
  (...args) => {
    if (!soundStore.get() || document.hidden) return;
    try {
      fn(...args);
    } catch {}
  };

const clack = (delay, gain = 1) => {
  noise({
    dur: 0.035,
    gain: 0.07 * gain,
    freq: 2600 + Math.random() * 1800,
    q: 3,
    delay,
  });
  tone({
    freq: 1500 + Math.random() * 600,
    to: 900,
    dur: 0.03,
    type: 'triangle',
    gain: 0.018 * gain,
    delay,
  });
};

export const sfx = {
  tap: play(() => tone({ freq: 900, to: 620, dur: 0.035, gain: 0.022 })),
  hold: play(() => {
    clack(0, 1.1);
    tone({ freq: 190, to: 120, dur: 0.06, gain: 0.08 });
  }),
  release: play(() => clack(0, 0.6)),
  roll: play((dice, land) => {
    noise({ dur: 0.34, gain: 0.03, freq: 1800, q: 0.6 });
    for (let i = 0; i < Math.min(dice * 2, 16); i++) {
      clack(0.02 + Math.random() * 0.34, 0.5 + Math.random() * 0.4);
    }
    for (let i = 0; i < dice; i++) {
      clack(land + i * 0.028 + Math.random() * 0.02, 0.9);
    }
  }),
  win: play(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone({
        freq: f,
        dur: 0.5,
        type: 'triangle',
        gain: 0.07,
        delay: 0.1 + i * 0.09,
      });
    });
    for (let i = 0; i < 10; i++) clack(i * 0.05, 0.5);
  }),
  lose: play(() => {
    tone({ freq: 330, to: 300, dur: 0.22, type: 'triangle', gain: 0.07 });
    tone({
      freq: 262,
      to: 220,
      dur: 0.36,
      type: 'triangle',
      gain: 0.07,
      delay: 0.18,
    });
  }),
  error: play(() =>
    tone({ freq: 240, to: 170, dur: 0.14, type: 'square', gain: 0.018 }),
  ),
};
