import {
  ChartColumn,
  CircleHelp,
  RotateCcw,
  Share,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Die from './components/Die.jsx';
import HowTo from './components/HowTo.jsx';
import Mark from './components/Mark.jsx';
import RollingNumber from './components/RollingNumber.jsx';
import Stats from './components/Stats.jsx';
import Toaster from './components/Toaster.jsx';
import { createDice } from './lib/dice3d.js';
import { clock, finished, NAMES, summary } from './lib/game.js';
import {
  elapsed,
  hold,
  restart,
  STAGGER,
  TUMBLE,
  throwDice,
  useCheer,
  useGame,
  useRolling,
  useStats,
} from './lib/play.js';
import { sfx, soundStore } from './lib/sound.js';
import { toast, useStore } from './lib/store.js';

const EASE = [0.23, 1, 0.32, 1];

function useNow(running) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running]);
}

function Tally({ game, stats, rolling }) {
  useNow(game.status === 'playing');
  const best = game.best?.rolls && !rolling;
  return (
    <div className="grid grid-cols-[5rem_7rem_5rem] items-start short:grid-cols-[4.5rem_6rem_4.5rem] sm:grid-cols-[6rem_8.5rem_6rem]">
      <Stat label="Rolls">
        <RollingNumber value={game.rolls} />
      </Stat>
      <Stat label="Time">{clock(elapsed(game))}</Stat>
      <Stat
        label={
          <>
            <span
              className="swap col-start-1 row-start-1"
              data-shown={!best}
              aria-hidden={best}
            >
              Best
            </span>
            <span
              className="swap col-start-1 row-start-1"
              data-shown={!!best}
              aria-hidden={!best}
            >
              New best
            </span>
          </>
        }
        dim={!best}
      >
        {stats.bestRolls == null ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="sr-only">None yet</span>
          </>
        ) : (
          <RollingNumber value={stats.bestRolls} />
        )}
      </Stat>
    </div>
  );
}

function Stat({ label, dim, children }) {
  return (
    <div className="grid justify-items-center gap-1.5">
      <span
        className={`flex h-[1em] items-center font-display text-[1.75rem] leading-none font-medium tracking-tight whitespace-nowrap tabular-nums short:text-2xl sm:text-4xl ${dim ? 'text-chalk-2' : ''}`}
      >
        {children}
      </span>
      <span className="grid justify-items-center text-xs font-medium whitespace-nowrap text-chalk-2">
        {label}
      </span>
    </div>
  );
}

function oddDice(game) {
  const locked = game.dice.filter((d) => d.locked);
  const count = {};
  for (const d of locked) count[d.value] = (count[d.value] ?? 0) + 1;
  const top = Number(
    Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0,
  );
  return new Set(locked.filter((d) => d.value !== top).map((d) => d.id));
}

function message(game, rolling) {
  const s = summary(game);
  if (game.status === 'won' && !rolling) {
    const note = game.best?.first
      ? ' First win.'
      : game.best?.rolls
        ? ' Fewest rolls yet.'
        : game.best?.time
          ? ' Fastest yet.'
          : '';
    return {
      key: 'won',
      title: 'Tenzies!',
      text: `${game.rolls} ${game.rolls === 1 ? 'roll' : 'rolls'} in ${clock(game.ms)}, all on ${NAMES[game.dice[0].value]}.${note}`,
    };
  }
  if (game.status === 'lost' && !rolling) {
    const vals = [
      ...new Set(game.dice.filter((d) => d.locked).map((d) => d.value)),
    ].sort();
    return {
      key: 'lost',
      title: 'No match',
      text:
        vals.length === 2
          ? `You held ${NAMES[vals[0]]} and ${NAMES[vals[1]]}, so all ten can’t match now.`
          : 'You held different numbers, so all ten can’t match now.',
    };
  }
  if (game.status === 'ready') {
    return {
      key: 'ready',
      text: 'Tap dice to hold them. Roll the rest until all ten match.',
    };
  }
  if (s.mismatch) {
    return {
      key: 'mismatch',
      warn: true,
      text: 'Your held dice don’t match. Let one go before you roll.',
    };
  }
  if (!s.count) {
    return {
      key: 'none',
      text: 'Pick a number and hold every die that shows it.',
    };
  }
  return {
    key: `n${s.count}`,
    text: `${s.count} of 10 on ${NAMES[s.value]}. Roll the other ${s.rolled}.`,
  };
}

function Message({ game, rolling }) {
  const m = message(game, rolling);
  return (
    <div
      className="grid h-19 w-full max-w-84 place-items-center text-center short:h-18.5 sm:h-20"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={m.key}
          className="col-start-1 row-start-1 grid justify-items-center gap-1.5"
          initial={{ opacity: 0, transform: 'translateY(6px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          exit={{
            opacity: 0,
            transform: 'translateY(-4px)',
            transition: { duration: 0.12 },
          }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          {m.title && (
            <p className="font-display text-xl font-bold tracking-tight short:text-lg sm:text-2xl">
              {m.title}
            </p>
          )}
          <p
            className={`text-[15px] leading-snug text-balance short:text-sm ${m.warn ? 'text-ivory' : 'text-chalk-2'}`}
          >
            {m.warn && (
              <span className="me-2 inline-block size-2 -translate-y-px rounded-full bg-red align-middle shadow-[0_0_0_2px_rgb(244_237_224/0.9)]" />
            )}
            {m.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Board({ game, rolling }) {
  const cheer = useCheer();
  const [flat, setFlat] = useState(false);
  const board = useRef(null);
  const canvas = useRef(null);
  const engine = useRef(null);
  const seen = useRef(cheer);
  const told = useRef(false);
  const shook = useRef('');

  const odd = game.status === 'lost' && !rolling ? oddDice(game) : null;
  let order = 0;
  const orders = game.dice.map((d) => (d.held || d.locked ? 0 : order++));
  const over = finished(game);

  useLayoutEffect(() => {
    const e = createDice(canvas.current, { tumble: TUMBLE, stagger: STAGGER });
    if (!e) {
      setFlat(true);
      return;
    }
    engine.current = e;
    const measure = () => {
      const buttons = [...board.current.querySelectorAll('.die')];
      const s = buttons[0].offsetWidth;
      const rects = buttons.map((b) => ({
        x: b.offsetLeft + s / 2,
        y: b.offsetTop + s / 2,
      }));
      const pad = Math.round(s * 0.7);
      const c = canvas.current.style;
      c.left = `${-pad}px`;
      c.top = `${-pad}px`;
      c.width = `${board.current.offsetWidth + pad * 2}px`;
      c.height = `${board.current.offsetHeight + pad * 2}px`;
      e.layout(rects, s, pad);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(board.current);
    const lost = (ev) => {
      ev.preventDefault();
      setFlat(true);
    };
    const el = canvas.current;
    el.addEventListener('webglcontextlost', lost);
    return () => {
      ro.disconnect();
      el.removeEventListener('webglcontextlost', lost);
      e.dispose();
      engine.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    engine.current?.sync(game.dice, { orders, odd, over });
  });

  useEffect(() => {
    if (cheer === seen.current) return;
    seen.current = cheer;
    engine.current?.cheer();
  }, [cheer]);

  const oddKey = odd ? [...odd].join(',') : '';
  useEffect(() => {
    if (!oddKey) {
      shook.current = '';
      return;
    }
    if (oddKey === shook.current) return;
    shook.current = oddKey;
    engine.current?.shake(new Set(oddKey.split(',').map(Number)));
  }, [oddKey]);

  const onPress = (i, down) => {
    if (down && (rolling || over || game.dice[i].locked)) return;
    engine.current?.press(i, down);
  };

  const onHold = (i) => {
    if (hold(i) === 'locked') {
      engine.current?.shake(new Set([i]), 0.7, 260, 0);
      if (!told.current) {
        told.current = true;
        toast({
          title: 'Held for good',
          body: 'Once you roll, held dice stay held.',
        });
      }
    }
  };

  return (
    <div ref={board} className={`board ${flat ? 'flat' : ''}`}>
      {game.dice.map((d, i) => (
        <Die
          key={d.id}
          die={d}
          order={orders[i]}
          odd={odd?.has(d.id)}
          over={over}
          disabled={over || rolling}
          onHold={onHold}
          onPress={onPress}
        />
      ))}
      <canvas ref={canvas} className="dice-canvas" />
    </div>
  );
}

async function share(game) {
  const text = `Tenzies in ${game.rolls} ${game.rolls === 1 ? 'roll' : 'rolls'}, ${clock(game.ms)}. All ten on ${NAMES[game.dice[0].value]}.`;
  const url = 'https://tenzies.ashwin.co.in';
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ text, url });
    } catch {}
    return;
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast({ title: 'Copied', body: 'Paste it anywhere.' });
  } catch {
    toast({ title: 'Not copied', body: 'Your browser blocked the clipboard.' });
  }
}

export default function App() {
  const game = useGame();
  const stats = useStats();
  const rolling = useRolling();
  const sound = useStore(soundStore);
  const [sheet, setSheet] = useState(null);
  const over = finished(game) && !rolling;
  const won = over && game.status === 'won';
  const warn = summary(game).mismatch && !finished(game);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (e.key === ' ') {
        e.preventDefault();
        throwDice();
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        hold(e.key === '0' ? 9 : Number(e.key) - 1);
        return;
      }
      if (e.key === 'n' || e.key === 'N') restart();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      const el = e.target.closest?.('button, a');
      if (!el || el.closest('[data-sfx="none"]')) return;
      sfx.tap();
    };
    addEventListener('pointerdown', onDown);
    return () => removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <>
      <div className="tray grid grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto]">
        <header className="flex items-center justify-between gap-2 ps-3.5 pe-2 pt-3 min-[400px]:pe-3 short:pt-2 roomy:px-6 roomy:pt-5">
          <Mark />
          <nav className="flex items-center max-[359px]:[&_.tool]:w-9 sm:gap-1">
            <span className="grid">
              <button
                type="button"
                className="tool swap col-start-1 row-start-1"
                data-shown={game.status === 'playing' && !rolling}
                aria-label="New game"
                data-tip="New game"
                data-key="N"
                aria-hidden={game.status !== 'playing'}
                tabIndex={game.status === 'playing' ? 0 : -1}
                onClick={restart}
              >
                <RotateCcw size={20} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="tool swap col-start-1 row-start-1"
                data-shown={won}
                aria-label="Share your result"
                data-tip="Share result"
                aria-hidden={!won}
                tabIndex={won ? 0 : -1}
                onClick={() => share(game)}
              >
                <Share size={20} strokeWidth={2} />
              </button>
            </span>
            <button
              type="button"
              className="tool"
              aria-label="Your games"
              data-tip="Your games"
              onClick={() => setSheet('stats')}
            >
              <ChartColumn size={20} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="tool"
              aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}
              data-tip={sound ? 'Mute' : 'Sound on'}
              aria-pressed={!sound}
              onClick={() => soundStore.set(!sound)}
            >
              <span className="grid">
                <Volume2
                  size={20}
                  strokeWidth={2}
                  className="swap col-start-1 row-start-1"
                  data-shown={sound}
                />
                <VolumeX
                  size={20}
                  strokeWidth={2}
                  className="swap col-start-1 row-start-1"
                  data-shown={!sound}
                />
              </span>
            </button>
            <button
              type="button"
              className="tool"
              aria-label="How to play"
              onClick={() => setSheet('help')}
            >
              <CircleHelp size={20} strokeWidth={2} />
            </button>
          </nav>
        </header>

        <main className="flex min-h-0 flex-col items-center px-4 roomy:justify-center roomy:gap-9">
          <section
            aria-label="Game"
            className="flex w-full flex-1 flex-col items-center justify-center gap-6 short:gap-3 roomy:flex-none roomy:gap-8"
          >
            <Tally game={game} stats={stats} rolling={rolling} />
            <Board game={game} rolling={rolling} />
            <Message game={game} rolling={rolling} />
          </section>

          <div className="grid w-full max-w-[20rem] justify-items-center gap-4 pb-4 short:max-w-[24rem] short:pb-2 roomy:pb-0">
            <div className="flex w-full gap-2">
              <button
                type="button"
                data-sfx="none"
                className="btn-ivory press h-14 min-w-0 flex-1 rounded-2xl font-display text-[17px] font-bold short:h-12"
                aria-disabled={rolling || undefined}
                onClick={throwDice}
              >
                <span className="grid justify-items-center">
                  {[
                    ['roll', 'Roll'],
                    ['warn', 'Roll anyway'],
                    ['over', 'Play again'],
                  ].map(([key, text]) => {
                    const shown =
                      (over ? 'over' : warn ? 'warn' : 'roll') === key;
                    return (
                      <span
                        key={key}
                        className="swap col-start-1 row-start-1"
                        data-shown={shown}
                        aria-hidden={!shown}
                      >
                        {text}
                      </span>
                    );
                  })}
                </span>
              </button>
            </div>
            <p className="hidden items-center gap-3.5 text-xs text-chalk-2 fine:flex short:hidden">
              <span className="flex items-center gap-1.5">
                <Key>Space</Key> Roll
              </span>
              <span className="flex items-center gap-1.5">
                <Key>1</Key> to <Key>0</Key> Hold
              </span>
              <span className="flex items-center gap-1.5">
                <Key>N</Key> New game
              </span>
            </p>
          </div>
        </main>

        <footer className="flex justify-center gap-4 px-4 pb-3 text-xs text-chalk-2 short:pb-2 roomy:pb-5">
          <a
            href="https://ashwin.co.in"
            className="rounded transition-colors hover-fine:text-chalk"
          >
            Made by Ashwin
          </a>
          <a
            href="https://github.com/Ashwin-S-Nambiar/Tenzies"
            className="rounded transition-colors hover-fine:text-chalk"
          >
            Source
          </a>
        </footer>
      </div>
      <Stats open={sheet === 'stats'} onClose={() => setSheet(null)} />
      <HowTo open={sheet === 'help'} onClose={() => setSheet(null)} />
      <Toaster />
    </>
  );
}

function Key({ children }) {
  return (
    <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-[5px] px-1.5 font-sans text-[11px] font-semibold text-chalk shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(255_255_255/0.12)]">
      {children}
    </kbd>
  );
}
