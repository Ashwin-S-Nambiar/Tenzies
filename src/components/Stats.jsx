import { useState } from 'react';
import { clock, NAMES } from '../lib/game.js';
import { resetStats, useStats } from '../lib/play.js';
import { Mini } from './Die.jsx';
import Sheet from './Sheet.jsx';

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function ago(at) {
  const s = Math.round((at - Date.now()) / 1000);
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(s) >= size) return rtf.format(Math.round(s / size), unit);
  }
  return 'just now';
}

function Tile({ label, value, sub }) {
  return (
    <div className="grid content-start gap-1 rounded-2xl bg-black/15 px-3.5 py-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]">
      <span className="text-xs font-medium text-chalk-2">{label}</span>
      <span className="font-display text-xl font-medium tracking-tight tabular-nums">
        {value}
      </span>
      {sub && <span className="text-xs text-chalk-2">{sub}</span>}
    </div>
  );
}

export default function Stats({ open, onClose }) {
  const stats = useStats();
  const [confirm, setConfirm] = useState(false);
  const rate = stats.played ? Math.round((stats.won / stats.played) * 100) : 0;

  return (
    <Sheet
      open={open}
      onClose={() => {
        setConfirm(false);
        onClose();
      }}
      title="Your games"
    >
      <div className="grid grid-cols-6 gap-2 *:col-span-2 [&>*:nth-child(n+4)]:col-span-3">
        <Tile label="Played" value={stats.played} />
        <Tile
          label="Won"
          value={`${rate}%`}
          sub={`${stats.won} of ${stats.played}`}
        />
        <Tile
          label="Streak"
          value={stats.streak}
          sub={`Best ${stats.bestStreak}`}
        />
        <Tile label="Fewest rolls" value={stats.bestRolls ?? 'None yet'} />
        <Tile
          label="Fastest"
          value={stats.bestMs == null ? 'None yet' : clock(stats.bestMs)}
        />
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold">Last games</h3>
      {stats.recent.length ? (
        <ul className="grid">
          {stats.recent.map((g) => (
            <li
              key={g.at}
              className="flex items-center gap-3 border-t border-white/8 py-2.5 first:border-t-0"
            >
              <Mini value={g.won ? g.value : 1} held={g.won} ghost={!g.won} />
              <span className="grid min-w-0 flex-1 leading-tight">
                <span className="text-[15px] font-medium">
                  {g.won ? `Tenzies on ${NAMES[g.value]}` : 'No match'}
                </span>
                <span className="text-xs text-chalk-2">{ago(g.at)}</span>
              </span>
              <span className="text-end text-sm">
                {g.rolls} {g.rolls === 1 ? 'roll' : 'rolls'}
                <span className="block text-xs text-chalk-2">
                  {clock(g.ms)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl px-4 py-5 text-center text-sm text-chalk-2 shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.1)]">
          Finish a game and it shows up here.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-chalk-2">Kept on this device only.</p>
        {stats.played > 0 && (
          <button
            type="button"
            className={`press h-9 rounded-xl px-3.5 text-sm font-semibold transition-colors ${confirm ? 'bg-red text-ivory' : 'btn-felt'}`}
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              resetStats();
              setConfirm(false);
            }}
          >
            {confirm ? 'Tap again to clear' : 'Clear stats'}
          </button>
        )}
      </div>
    </Sheet>
  );
}
