import { useState } from "react";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import type { Card, Column } from "#/lib/board-types";
import { useRenameColumn, useDeleteColumn } from "#/features/board/queries";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  id,
  title,
  cards,
  onAddCard,
  onOpenCard,
  onRenamed,
  onDeleted,
}: {
  id: number;
  title: string;
  cards: Card[];
  onAddCard: () => void;
  onOpenCard: (card: Card) => void;
  onRenamed: (column: Column) => void;
  onDeleted: (id: number) => void;
}) {
  const { ref } = useDroppable({
    id,
    collisionPriority: CollisionPriority.Low,
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
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}" and its ${cards.length} card(s)?`)) return;
    try {
      await remove.mutateAsync(id);
      onDeleted(id);
    } catch (err) {
      console.error("Failed to delete column:", err);
      alert("Failed to delete column.");
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-[#DEDCD4] pb-2.5">
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
            onDoubleClick={() => {
              setDraft(title);
              setEditing(true);
            }}
            className="text-[12px] font-semibold uppercase"
          >
            {title}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#9A9D9F]">{cards.length}</span>
          <button
            type="button"
            onClick={handleDelete}
            className="cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-none text-[#9A9D9F] hover:text-[#C0392B]"
          >
            ✕
          </button>
        </div>
      </div>

      <div ref={ref} className="flex min-h-5 flex-1 flex-col gap-2">
        {cards.map((card, index) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={index}
            columnId={id}
            onOpen={onOpenCard}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCard}
        className="mt-3.5 cursor-pointer border-0 bg-transparent px-0 py-0.5 text-left text-[12px] font-normal text-[#9A9D9F] transition-colors duration-150 hover:text-[#6B6F76]"
      >
        + Add card
      </button>
    </div>
  );
}