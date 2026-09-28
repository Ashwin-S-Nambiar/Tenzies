import { useLayoutEffect, useRef } from 'react';
import { STAGGER, TUMBLE } from '../lib/play.js';

const PIPS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((k) => (
  <i key={k} />
));

export const WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six'];

const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Die({
  die,
  order,
  odd,
  over,
  disabled,
  onHold,
  onPress,
}) {
  const shade = useRef(null);
  const last = useRef(null);
  const wait = useRef(order);
  wait.current = order;
  const turn = `${die.value}:${die.tx}:${die.ty}:${die.tz ?? 0}`;

  useLayoutEffect(() => {
    const prev = last.current;
    last.current = turn;
    if (!prev || prev === turn || still() || document.hidden) return;
    const a = shade.current.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0.5, transform: 'scale(0.82)', offset: 0.3 },
        { opacity: 1, transform: 'scale(1)', offset: 0.62 },
        { opacity: 0.9, transform: 'scale(0.97)', offset: 0.76 },
        { opacity: 1, transform: 'scale(1)', offset: 0.88 },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: TUMBLE, delay: wait.current * STAGGER, fill: 'backwards' },
    );
    return () => a.cancel();
  }, [turn]);

  const state =
    die.locked || (die.held && over) ? 'locked' : die.held ? 'held' : '';
  const label = `Die ${die.id === 9 ? 10 : die.id + 1}, ${WORD[die.value]}${die.locked ? ', held for good' : die.held ? ', held' : ''}`;
  return (
    <button
      type="button"
      data-sfx="none"
      className={`die ${state} ${odd ? 'odd' : ''}`}
      aria-pressed={die.held || die.locked}
      aria-disabled={disabled || die.locked || undefined}
      aria-label={label}
      onClick={() => onHold(die.id)}
      onPointerDown={() => onPress(die.id, true)}
      onPointerUp={() => onPress(die.id, false)}
      onPointerLeave={() => onPress(die.id, false)}
      onPointerCancel={() => onPress(die.id, false)}
    >
      <span ref={shade} className="shade" />
      <span className="flat" data-v={die.value}>
        {PIPS}
      </span>
    </button>
  );
}

export function Mini({ value, held, ghost, size = 28, className = '' }) {
  return (
    <span
      className={`mini ${held ? 'held' : ''} ${ghost ? 'ghost' : ''} ${className}`}
      data-v={value}
      style={{ '--s': typeof size === 'number' ? `${size}px` : size }}
      aria-hidden="true"
    >
      {PIPS}
    </span>
  );
}
