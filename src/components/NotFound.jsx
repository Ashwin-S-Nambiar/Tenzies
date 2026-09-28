import { useEffect } from 'react';
import { Mini } from './Die.jsx';
import Mark from './Mark.jsx';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not found · Tenzies';
  }, []);
  return (
    <div className="tray grid grid-rows-[auto_1fr_auto]">
      <header className="flex items-center px-3.5 pt-3 roomy:px-6 roomy:pt-5">
        <Mark />
      </header>
      <main className="grid place-content-center justify-items-center gap-7 px-6 text-center">
        <div className="flex items-center gap-3">
          <Mini value={4} size="clamp(64px, 18vw, 96px)" />
          <Mini ghost size="clamp(64px, 18vw, 96px)" className="opacity-80" />
          <Mini value={4} size="clamp(64px, 18vw, 96px)" />
        </div>
        <div className="grid gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            This page rolled off the table.
          </h1>
          <p className="text-[15px] text-chalk-2">
            There’s nothing at this address.
          </p>
        </div>
        <a
          href="/"
          className="btn-ivory press grid h-14 w-full max-w-[20rem] place-items-center rounded-2xl font-display text-[17px] font-bold"
        >
          Back to the game
        </a>
      </main>
      <footer className="flex justify-center gap-4 px-4 pb-3 text-xs text-chalk-2 roomy:pb-5">
        <a href="https://ashwin.co.in" className="hover-fine:text-chalk">
          Made by Ashwin
        </a>
      </footer>
    </div>
  );
}
