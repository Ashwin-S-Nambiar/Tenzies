import { Mini } from './Die.jsx';
import Sheet from './Sheet.jsx';

const SLOTS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

const STEPS = [
  {
    text: 'Roll all ten dice.',
    dice: [3, 5, 4, 1, 4, 6, 2, 4, 5, 3],
    held: [],
  },
  {
    text: 'Pick a number and tap every die that shows it. Held dice turn white.',
    dice: [3, 5, 4, 1, 4, 6, 2, 4, 5, 3],
    held: [2, 4, 7],
  },
  {
    text: 'Roll again. Held dice stay put, and once you roll they stay held.',
    dice: [6, 4, 4, 2, 4, 4, 1, 4, 3, 4],
    held: [1, 2, 4, 5, 7, 9],
  },
  {
    text: 'Get all ten on one number to win. Roll with a die that doesn’t match and the game is over.',
    dice: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    held: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];

function Kbd({ children }) {
  return (
    <kbd className="inline-grid h-6 min-w-6 place-items-center rounded-md px-1.5 font-sans text-xs font-semibold text-chalk shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(255_255_255/0.12)]">
      {children}
    </kbd>
  );
}

export default function HowTo({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="How to play">
      <ol className="grid gap-5">
        {STEPS.map((s, n) => (
          <li
            key={s.text}
            className="grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-2.5"
          >
            <span className="font-display text-sm font-semibold text-chalk-2 tabular-nums">
              {n + 1}
            </span>
            <p className="text-[15px] leading-snug text-pretty">{s.text}</p>
            <span className="col-start-2 flex flex-wrap gap-1.5">
              {SLOTS.map((slot, i) => (
                <Mini
                  key={slot}
                  value={s.dice[i]}
                  held={s.held.includes(i)}
                  size={24}
                />
              ))}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm leading-snug text-chalk-2">
        Fewer rolls is better. The clock starts on your first move and stops
        when you leave the tab.
      </p>
      <dl className="mt-5 hidden gap-2.5 border-t border-white/10 pt-5 text-sm fine:grid">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-chalk-2">Roll, or play again</dt>
          <dd>
            <Kbd>Space</Kbd>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-chalk-2">Hold die 1 to 10</dt>
          <dd className="flex items-center gap-1.5">
            <Kbd>1</Kbd>
            <span className="text-chalk-2">to</span>
            <Kbd>0</Kbd>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-chalk-2">New game</dt>
          <dd>
            <Kbd>N</Kbd>
          </dd>
        </div>
      </dl>
    </Sheet>
  );
}
