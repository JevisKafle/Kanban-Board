import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateCard,
  useDeleteCard,
  useUpdateCard,
} from "#/features/board/queries";
import type { Card } from "#/lib/board-types";
import { confirmAction } from "./ConfirmDialog";

export function CardDetailModal({
  card,
  columnId,
  canEdit,
  onClose,
  onSaved,
  onDeleted,
}: {
  card: Card | null;
  columnId: number;
  canEdit: boolean;
  onClose: () => void;
  onSaved: (saved: Card) => void;
  onDeleted: (cardId: number) => void;
}) {
  const isCreating = !card;
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const createCard = useCreateCard();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
  }, [card]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("Card title is required.");
      return;
    }

    try {
      if (card) {
        const saved = await updateCard.mutateAsync({
          id: card.id,
          title: nextTitle,
          description: description.trim(),
        });
        onSaved(saved);
      } else {
        const saved = await createCard.mutateAsync({
          column: columnId,
          title: nextTitle,
          description: description.trim(),
        });
        onSaved(saved);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save card:", err);
      toast.error(card ? "Couldn't update the card." : "Couldn't create the card.");
    }
  }

  async function handleDelete() {
    if (!card) return;

    const ok = await confirmAction({
      title: `Delete "${card.title}"?`,
      message: "This card will be removed from the board.",
      confirmLabel: "Delete card",
    });
    if (!ok) return;

    try {
      await deleteCard.mutateAsync(card.id);
      onDeleted(card.id);
      toast.success("Card deleted");
      onClose();
    } catch (err) {
      console.error("Failed to delete card:", err);
      toast.error("Couldn't delete the card.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-detail-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-[18px] border border-line bg-white p-5 shadow-[0_24px_48px_-16px_rgba(20,23,43,0.35)]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="card-detail-title" className="text-[20px] font-semibold text-ink">
            {isCreating ? "Add card" : "Edit card"}
          </h2>
          {!isCreating && canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-danger transition-colors hover:bg-danger/5 focus-visible:outline-2 focus-visible:outline-danger"
            >
              Delete
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              Title
            </span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details for this card..."
              rows={6}
              className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-[14px] text-ink outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={createCard.isPending || updateCard.isPending || deleteCard.isPending}
                className="cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                {isCreating ? "Add card" : "Save changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}