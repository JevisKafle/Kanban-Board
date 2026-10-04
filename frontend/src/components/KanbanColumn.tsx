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
      className={`flex min-w-0 flex-1 flex-col rounded-md p-1.5 transition-colors duration-150 ${isDragging ? "opacity-50" : "opacity-100"
        } ${isDropTarget && !isDragging ? "bg-[#ECEAE3]" : "bg-transparent"}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#DEDCD4] pb-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {canEdit && (
            <button
              ref={handleRef}
              type="button"
              aria-label="Drag to reorder column"
              className="cursor-grab touch-none border-0 bg-transparent p-0 text-[12px] leading-none text-[#9A9D9F] hover:text-[#6B6F76]"
            >
              ⋮⋮
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
              className="w-full text-[12px] font-semibold uppercase outline-none"
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
              className="truncate text-[12px] font-semibold uppercase"
            >
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#9A9D9F]">{cards.length}</span>
          {canEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-none text-[#9A9D9F] hover:text-danger"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-24 flex-1 flex-col gap-2">
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
          className="mt-3.5 cursor-pointer border-0 bg-transparent px-0 py-0.5 text-left text-[12px] font-normal text-[#9A9D9F] transition-colors duration-150 hover:text-[#6B6F76]"
        >
          + Add card
        </button>
      )}
    </div>
  );
}