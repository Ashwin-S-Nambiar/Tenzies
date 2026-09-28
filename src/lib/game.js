export const COUNT = 10;

export const NAMES = ['', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
export const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

const face = () => 1 + Math.floor(Math.random() * 6);

export function newGame() {
  return {
    dice: Array.from({ length: COUNT }, (_, id) => ({
      id,
      value: face(),
      held: false,
      locked: false,
      tx: 0,
      ty: 0,
      tz: Math.floor(Math.random() * 4),
    })),
    rolls: 0,
    ms: 0,
    status: 'ready',
  };
}

export const kept = (game) => game.dice.filter((d) => d.held || d.locked);

export const values = (dice) => [...new Set(dice.map((d) => d.value))];

export const finished = (game) =>
  game.status === 'won' || game.status === 'lost';

function settle(game) {
  const keep = kept(game);
  if (keep.length === COUNT && values(keep).length === 1) {
    return { ...game, status: 'won' };
  }
  if (values(game.dice.filter((d) => d.locked)).length > 1) {
    return { ...game, status: 'lost' };
  }
  return game;
}

export function toggle(game, index) {
  const die = game.dice[index];
  if (!die || die.locked || finished(game)) return game;
  const dice = game.dice.map((d) =>
    d.id === index ? { ...d, held: !d.held } : d,
  );
  return settle({ ...game, dice, status: 'playing' });
}

export function roll(game) {
  if (finished(game)) return game;
  const dice = game.dice.map((d) => {
    if (d.held || d.locked) return { ...d, held: false, locked: true };
    return {
      ...d,
      value: face(),
      tx: d.tx + 1 + (Math.random() < 0.35 ? 1 : 0),
      ty: d.ty + (Math.random() < 0.3 ? 1 : 0),
      tz: (d.tz ?? 0) + Math.floor(Math.random() * 4) - 1,
    };
  });
  return settle({ ...game, dice, rolls: game.rolls + 1, status: 'playing' });
}

export function summary(game) {
  const keep = kept(game);
  const vals = values(keep);
  return {
    count: keep.length,
    value: vals.length === 1 ? vals[0] : null,
    mismatch: vals.length > 1,
    rolled: game.dice.filter((d) => !d.held && !d.locked).length,
  };
}

export function clock(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m >= 60) {
    return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function valid(game) {
  return (
    game &&
    Array.isArray(game.dice) &&
    game.dice.length === COUNT &&
    game.dice.every(
      (d, i) =>
        d.id === i &&
        Number.isInteger(d.value) &&
        d.value >= 1 &&
        d.value <= 6 &&
        Number.isInteger(d.tx) &&
        Number.isInteger(d.ty) &&
        (d.tz == null || Number.isInteger(d.tz)),
    ) &&
    Number.isInteger(game.rolls) &&
    Number.isFinite(game.ms) &&
    ['ready', 'playing', 'won', 'lost'].includes(game.status)
  );
}

export function record(stats, game) {
  const won = game.status === 'won';
  const entry = {
    won,
    rolls: game.rolls,
    ms: Math.round(game.ms),
    value: won ? game.dice[0].value : null,
    at: Date.now(),
  };
  const streak = won ? stats.streak + 1 : 0;
  return {
    next: {
      played: stats.played + 1,
      won: stats.won + (won ? 1 : 0),
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      bestRolls:
        won && (stats.bestRolls == null || game.rolls < stats.bestRolls)
          ? game.rolls
          : stats.bestRolls,
      bestMs:
        won && (stats.bestMs == null || entry.ms < stats.bestMs)
          ? entry.ms
          : stats.bestMs,
      recent: [entry, ...stats.recent].slice(0, 10),
    },
    best: {
      rolls: won && (stats.bestRolls == null || game.rolls < stats.bestRolls),
      time: won && (stats.bestMs == null || entry.ms < stats.bestMs),
      first: won && stats.won === 0,
    },
  };
}

export const emptyStats = {
  played: 0,
  won: 0,
  streak: 0,
  bestStreak: 0,
  bestRolls: null,
  bestMs: null,
  recent: [],
};
