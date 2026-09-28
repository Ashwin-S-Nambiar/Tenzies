import {
  emptyStats,
  finished,
  newGame,
  record,
  roll,
  toggle,
  valid,
} from './game.js';
import { sfx } from './sound.js';
import {
  buzz,
  createPersistedStore,
  createStore,
  toast,
  useStore,
} from './store.js';

export const TUMBLE = 720;
export const STAGGER = 26;
export const LAND = 0.34;

export const gameStore = createPersistedStore('tz:game', null);
if (!valid(gameStore.get())) gameStore.set(newGame());

export const statsStore = createPersistedStore('tz:stats', emptyStats);
if (typeof statsStore.get()?.played !== 'number') statsStore.set(emptyStats);

export const rollingStore = createStore(false);
export const cheerStore = createStore(0);

let runStart = null;

const visible = () => document.visibilityState === 'visible';

export function elapsed(game = gameStore.get()) {
  return game.ms + (runStart == null ? 0 : performance.now() - runStart);
}

function resume(game) {
  runStart = game.status === 'playing' && visible() ? performance.now() : null;
}

function commit() {
  const game = gameStore.get();
  if (runStart == null) return;
  gameStore.set({ ...game, ms: elapsed(game) });
  resume(gameStore.get());
}

resume(gameStore.get());

document.addEventListener('visibilitychange', () => {
  if (visible()) {
    resume(gameStore.get());
  } else {
    commit();
    runStart = null;
  }
});
addEventListener('pagehide', commit);

let rollTimer = 0;

function apply(next, prev) {
  if (!finished(prev) && finished(next)) {
    const result = record(statsStore.get(), next);
    statsStore.set(result.next);
    next = { ...next, best: result.best };
  }
  gameStore.set(next);
  resume(next);
  return next;
}

export function hold(index) {
  if (rollingStore.get()) return;
  const prev = { ...gameStore.get(), ms: elapsed() };
  const die = prev.dice[index];
  if (finished(prev)) return;
  if (die.locked) {
    sfx.error();
    buzz(4);
    return 'locked';
  }
  const next = apply(toggle(prev, index), prev);
  if (next.dice[index].held) sfx.hold();
  else sfx.release();
  buzz(next.dice[index].held ? 8 : 4);
  if (next.status === 'won') {
    sfx.win();
    buzz([12, 50, 12, 50, 30]);
    cheerStore.set((n) => n + 1);
  }
}

export function throwDice() {
  if (rollingStore.get()) return;
  const prev = { ...gameStore.get(), ms: elapsed() };
  if (finished(prev)) {
    restart();
    return;
  }
  const moving = prev.dice.filter((d) => !d.held && !d.locked).length;
  const next = apply(roll(prev), prev);
  sfx.roll(moving, LAND);
  buzz(10);
  rollingStore.set(true);
  clearTimeout(rollTimer);
  rollTimer = setTimeout(
    () => {
      rollingStore.set(false);
      if (next.status === 'lost') {
        sfx.lose();
        buzz([30, 60, 30]);
      }
    },
    matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 120
      : TUMBLE * 0.8 + moving * STAGGER,
  );
}

export function restart() {
  const prev = { ...gameStore.get(), ms: elapsed() };
  const next = newGame();
  gameStore.set(next);
  resume(next);
  sfx.tap();
  if (prev.status === 'playing') {
    const t = toast({
      title: 'New game',
      body: `Dropped the last one at ${prev.rolls} ${prev.rolls === 1 ? 'roll' : 'rolls'}.`,
      action: {
        label: 'Undo',
        run: () => {
          gameStore.set(prev);
          resume(prev);
        },
      },
    });
    return t;
  }
}

export function resetStats() {
  statsStore.set(emptyStats);
}

export const useGame = () => useStore(gameStore);
export const useStats = () => useStore(statsStore);
export const useRolling = () => useStore(rollingStore);
export const useCheer = () => useStore(cheerStore);
