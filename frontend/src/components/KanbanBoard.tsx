import { useState, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useBoardQuery } from "#/features/board/queries";
import type { Card, Column } from "#/lib/board-types";
import { KanbanColumn } from "./KanbanColumn";
import { CardDetailModal } from "./CardDetailModal";


export function KanbanBoard({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error } = useBoardQuery(boardId);

  const [columnMeta, setColumnMeta] = useState<Omit<Column, "cards">[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<number, Card[]>>({});
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<number | null>(null);

  useEffect(() => {
    if (!board) return;

    setColumnMeta(board.columns.map(({ cards, ...meta }) => meta));
    setCardsByColumn(
      Object.fromEntries(
        board.columns.map((col) => [col.id, col.cards])
      )
    );
  }, [board]);

  function handleCardSaved(saved: Card) {
    setCardsByColumn((prev) => {
      const next = { ...prev };
      const col = next[saved.column] ?? [];

      if (col.some((c) => c.id === saved.id)) {
        next[saved.column] = col.map((c) => (c.id === saved.id ? saved : c));
      } else {
        for (const key of Object.keys(next)) {
          next[Number(key)] = next[Number(key)].filter((c) => c.id !== saved.id);
        }
        next[saved.column] = [...(next[saved.column] ?? []), saved];
      }
      return next;
    });
  }

  function handleCardDeleted(cardId: number) {
    setCardsByColumn((prev) => {
      const next: Record<number, Card[]> = {};
      for (const [key, cards] of Object.entries(prev)) {
        next[Number(key)] = cards.filter((c) => c.id !== cardId);
      }
      return next;
    });
  }

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6">
        Failed to load board: {String(error)}
      </div>
    );
  }

  if (!board) return null;

  return (
    <DragDropProvider
      onDragOver={(event) => {
        setCardsByColumn((items) => move(items, event));
      }}
    >
      <div className="min-h-screen bg-[#F6F5F1] px-7 py-6">
        <h1 className="mb-5 text-[18px] font-bold">
          {board.title}
        </h1>

        <div className="flex items-start gap-3.5">
          {columnMeta.map((meta) => (
            <KanbanColumn
              key={meta.id}
              id={meta.id}
              title={meta.title}
              cards={cardsByColumn[meta.id] ?? []}
              onAddCard={() => {
                setOpenCard(null);
                setAddingToColumnId(meta.id);
              }}
              onOpenCard={(card) => {
                setAddingToColumnId(null);
                setOpenCard(card);
              }}
            />
          ))}
        </div>
        {(openCard || addingToColumnId !== null) && (
          <CardDetailModal
            card={openCard}
            columnId={openCard?.column ?? addingToColumnId!}
            onClose={() => {
              setOpenCard(null);
              setAddingToColumnId(null);
            }}
            onSaved={handleCardSaved}
            onDeleted={handleCardDeleted}
          />
        )}
      </div>
    </DragDropProvider>
  );
}