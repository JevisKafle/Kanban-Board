import { useEffect, useState } from "react";

type Options = {
  title: string;
  message?: string;
  confirmLabel?: string;
};

type Pending = Options & { resolve: (ok: boolean) => void };

let open: ((pending: Pending) => void) | null = null;
export function confirmAction(options: Options): Promise<boolean> {
  return new Promise((resolve) => {
    if (!open) {
      // Host not mounted (yet): fall back to the browser dialog.
      resolve(
        window.confirm(
          options.message ? `${options.title}\n\n${options.message}` : options.title,
        ),
      );
      return;
    }
    open({ ...options, resolve });
  });
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    open = (next) =>
      setPending((prev) => {
        prev?.resolve(false); // a newer confirm replaces an unanswered one
        return next;
      });
    return () => {
      open = null;
    };
  }, []);

  function finish(ok: boolean) {
    pending?.resolve(ok);
    setPending(null);
  }

  useEffect(() => {
    if (!pending) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  if (!pending) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={() => finish(false)}
      className="fixed inset-0 z-60 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out starting:opacity-0"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-[0_24px_48px_-16px_rgba(20,23,43,0.35)] transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-95 starting:opacity-0 motion-reduce:transition-none"
      >
        <h2 id="confirm-title" className="text-[18px] leading-snug font-semibold tracking-[-0.015em] text-ink">
          {pending.title}
        </h2>

        {pending.message && (
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{pending.message}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {/* Cancel is focused first so a stray Enter can't delete anything. */}
          <button
            autoFocus
            type="button"
            onClick={() => finish(false)}
            className="cursor-pointer rounded-lg border border-field/60 bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-surface active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            className="cursor-pointer rounded-lg bg-danger px-4 py-2 text-[13px] font-semibold text-white transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#a93226] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            {pending.confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}