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
      className="fixed inset-0 z-60 flex items-center justify-center bg-[rgba(28,31,38,0.4)] backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-md border border-[#DEDCD4] bg-white p-6 shadow-[0_12px_32px_rgba(28,31,38,0.16)]"
      >
        <h2 id="confirm-title" className="text-[16px] font-semibold text-[#1C1F26]">
          {pending.title}
        </h2>

        {pending.message && (
          <p className="mt-2 text-[13px] text-[#6B6F76]">{pending.message}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          {/* Cancel is focused first so a stray Enter can't delete anything. */}
          <button
            autoFocus
            type="button"
            onClick={() => finish(false)}
            className="cursor-pointer border-0 bg-transparent px-2.5 py-1.5 text-[12px] font-normal text-[#6B6F76]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            className="cursor-pointer rounded-[3px] border-0 bg-[#C0392B] px-3.5 py-1.5 text-[12px] font-medium text-white"
          >
            {pending.confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
