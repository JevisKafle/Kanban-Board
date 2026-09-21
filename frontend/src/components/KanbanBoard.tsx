import { useState, useEffect } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { useBoardQuery } from "#/features/board/queries";
import type { Card, Column } from "#/lib/board-types";
import { KanbanColumn } from "./KanbanColumn";
import { apiFetch } from "#/lib/api-client";


export function KanbanBoard({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error } = useBoardQuery(boardId);

  const [columnMeta, setColumnMeta] = useState<Omit<Column, "cards">[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<number, Card[]>>({});

  useEffect(() => {
    if (!board) return;

    setColumnMeta(board.columns.map(({ cards, ...meta }) => meta));
    setCardsByColumn(
      Object.fromEntries(
        board.columns.map((col) => [col.id, col.cards])
      )
    );
  }, [board]);

  async function handleAddCard(columnId: number, title: string) {
    const newCard = await apiFetch<Card>("/cards/", {
      method: "POST",
      body: JSON.stringify({ column: columnId, title }),
    });

    setCardsByColumn((prev) => ({
      ...prev,
      [columnId]: [...(prev[columnId] ?? []), newCard],
    }));
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
              onAddCard={handleAddCard}
            />
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
}