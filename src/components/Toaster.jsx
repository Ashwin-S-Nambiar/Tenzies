import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { dismissToast, toastStore, useStore } from '../lib/store.js';

export default function Toaster() {
  const toasts = useStore(toastStore);
  return createPortal(
    <ol
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))] z-40 flex h-60 flex-col items-center justify-end gap-2 px-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.li
            key={t.id}
            layout
            initial={{ opacity: 0, transform: 'translateY(14px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{
              opacity: 0,
              transform: 'translateY(8px)',
              transition: { duration: 0.14 },
            }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ivory py-2 ps-4 pe-1.5 text-ink shadow-[inset_0_-3px_0_var(--color-ivory-deep),0_16px_32px_-12px_rgb(0_0_0/0.6)]"
          >
            <span className="grid min-w-0 flex-1 py-0.5 text-sm leading-snug">
              <span className="font-semibold">{t.title}</span>
              {t.body && <span className="text-ink-2">{t.body}</span>}
            </span>
            {t.action && (
              <button
                type="button"
                className="press h-9 rounded-xl bg-ink px-3.5 text-sm font-semibold text-ivory"
                onClick={() => {
                  dismissToast(t.id);
                  t.action.run();
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              className="grid size-9 flex-none place-items-center rounded-xl text-ink-2 transition-colors hover-fine:bg-ink/5 hover-fine:text-ink"
              onClick={() => dismissToast(t.id)}
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>,
    document.body,
  );
}
