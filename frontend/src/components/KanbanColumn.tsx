import { useState } from "react";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionPriority } from "@dnd-kit/abstract";
import type { Card, Column } from "#/lib/board-types";
import { useRenameColumn, useDeleteColumn } from "#/features/board/queries";
import { KanbanCard } from "./KanbanCard";
import { confirmAction } from "./ConfirmDialog";

export function KanbanColumn({
  id,
  index,
  title,
  cards,
  onAddCard,
  onOpenCard,
  onRenamed,
  onDeleted,
  canEdit,
}: {
  id: number;
  index: number;
  title: string;
  cards: Card[];
  onAddCard: () => void;
  onOpenCard: (card: Card) => void;
  onRenamed: (column: Column) => void;
  onDeleted: (id: number) => void;
  canEdit: boolean;
}) {
  const { ref, handleRef, isDropTarget, isDragging } = useSortable({
    id: `col-${id}`,
    index,
    type: "column",
    accept: ["card", "column"],
    collisionPriority: CollisionPriority.Low,
    disabled: !canEdit,
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const rename = useRenameColumn();
  const remove = useDeleteColumn();

  async function commitRename() {
    const next = draft.trim();
    setEditing(false);
    if (!next || next === title) {
      setDraft(title);
      return;
    }
    try {
      onRenamed(await rename.mutateAsync({ id, title: next }));
    } catch (err) {
      console.error("Failed to rename column:", err);
      setDraft(title);
      toast.error("Couldn't rename the column.");
    }
  }

  async function handleDelete() {
    const ok = await confirmAction({
      title: `Delete "${title}"?`,
      message:
        cards.length > 0
          ? `Its ${cards.length} card${cards.length === 1 ? "" : "s"} will be deleted too. This can't be undone.`
          : undefined,
      confirmLabel: "Delete column",
    });
    if (!ok) return;

    try {
      await remove.mutateAsync(id);
      onDeleted(id);
      toast.success("Column deleted");
    } catch (err) {
      console.error("Failed to delete column:", err);
      toast.error("Couldn't delete the column.");
    }
  }

  return (
    <div
      ref={canEdit ? ref : undefined}
      className={`flex w-72 shrink-0 flex-col rounded-[14px] p-2 transition-[background-color,box-shadow,opacity] duration-150 ${isDragging ? "opacity-50" : "opacity-100"
        } ${isDropTarget && !isDragging
          ? "bg-brand-50 ring-2 ring-brand-200"
          : "bg-line/50 ring-0 ring-transparent"
        }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1.5 py-1">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {canEdit && (
            <button
              ref={handleRef}
              type="button"
              aria-label="Drag to reorder column"
              className="-ml-1 grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted/60 transition-colors duration-150 hover:bg-white hover:text-muted focus-visible:outline-2 focus-visible:outline-brand-600"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true" fill="currentColor">
                <circle cx="2.5" cy="2.5" r="1.3" />
                <circle cx="7.5" cy="2.5" r="1.3" />
                <circle cx="2.5" cy="7" r="1.3" />
                <circle cx="7.5" cy="7" r="1.3" />
                <circle cx="2.5" cy="11.5" r="1.3" />
                <circle cx="7.5" cy="11.5" r="1.3" />
              </svg>
            </button>
          )}

          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setDraft(title);
                  setEditing(false);
                }
              }}
              aria-label="Column title"
              className="w-full rounded-md border border-brand-600 bg-white px-1.5 py-0.5 text-[14px] font-semibold text-ink ring-4 ring-brand-600/15 outline-none"
            />
          ) : (
            <span
              onDoubleClick={
                canEdit
                  ? () => {
                    setDraft(title);
                    setEditing(true);
                  }
                  : undefined
              }
              title={canEdit ? "Double-click to rename" : undefined}
              className="truncate text-[14px] font-semibold text-ink"
            >
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-muted">
            {cards.length}
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`Delete column ${title}`}
              className="grid size-6 cursor-pointer place-items-center rounded-md text-muted/60 transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-24 flex-1 flex-col gap-2.5">
        {cards.map((card, cardIndex) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={cardIndex}
            columnId={id}
            onOpen={onOpenCard}
            canEdit={canEdit}
          />
        ))}
      </div>

      {canEdit && (
        <button
          type="button"
          onClick={onAddCard}
          className="mt-2 flex w-full cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-white/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 1.5v9M1.5 6h9" />
          </svg>
          Add card
        </button>
      )}
    </div>
  );
}