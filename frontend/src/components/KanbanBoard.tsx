import { useState, useEffect, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import {
  useBoardQuery,
  useCreateColumn,
  useMoveCard,
} from "#/features/board/queries";
import type { Card, Column } from "#/lib/board-types";
import { KanbanColumn } from "./KanbanColumn";
import { CardDetailModal } from "./CardDetailModal";
import { useBoardSocket } from "#/features/board/useBoardSocket";

function findCard(cols: Record<number, Card[]>, cardId: number) {
  for (const [colId, cards] of Object.entries(cols)) {
    const index = cards.findIndex((c) => c.id === cardId);
    if (index !== -1) return { columnId: Number(colId), index, cards };
  }
  return null;
}

export function KanbanBoard({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error, refetch } = useBoardQuery(boardId);

  const [columnMeta, setColumnMeta] = useState<Omit<Column, "cards">[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<number, Card[]>>({});
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<number | null>(null);

  const createColumn = useCreateColumn();
  const [newColumnTitle, setNewColumnTitle] = useState<string | null>(null);

  const moveCard = useMoveCard(boardId);
  const cardsRef = useRef(cardsByColumn);
  cardsRef.current = cardsByColumn;
  const snapshotRef = useRef<Record<number, Card[]> | null>(null);

  useEffect(() => {
    if (!board || snapshotRef.current) return;

    setColumnMeta(board.columns.map(({ cards, ...meta }) => meta));
    setCardsByColumn(
      Object.fromEntries(board.columns.map((col) => [col.id, col.cards])),
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

  function upsertColumn(column: Column) {
    const { cards, ...meta } = column;
    setColumnMeta((prev) =>
      prev.some((c) => c.id === meta.id)
        ? prev.map((c) => (c.id === meta.id ? meta : c))
        : [...prev, meta].sort((a, b) => a.position - b.position),
    );
    setCardsByColumn((prev) =>
      meta.id in prev ? prev : { ...prev, [meta.id]: [] },
    );
  }

  function removeColumn(columnId: number) {
    setColumnMeta((prev) => prev.filter((c) => c.id !== columnId));
    setCardsByColumn((prev) => {
      const { [columnId]: _removed, ...rest } = prev;
      return rest;
    });
  }

  async function handleAddColumn() {
    const title = (newColumnTitle ?? "").trim();
    if (!title || !board) return;
    try {
      upsertColumn(await createColumn.mutateAsync({ board: board.id, title }));
      setNewColumnTitle(null);
    } catch (err) {
      console.error("Failed to add column:", err);
      alert("Failed to add column.");
    }
  }

  function handleDragStart() {
    snapshotRef.current = cardsRef.current;
  }

  function handleDragEnd(event: any) {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (!snapshot) return;

    if (event.canceled) {
      setCardsByColumn(snapshot);
      return;
    }

    const source = event.operation.source;
    if (!source) return;
    const cardId = Number(source.id);

    const to = findCard(cardsRef.current, cardId);
    const from = findCard(snapshot, cardId);
    if (!to || !from) return;

    if (to.columnId === from.columnId && to.index === from.index) return;

    moveCard.mutate(
      {
        cardId,
        column: to.columnId,
        before_id: to.cards[to.index - 1]?.id ?? null,
        after_id: to.cards[to.index + 1]?.id ?? null,
      },
      { onError: () => setCardsByColumn(snapshot) },
    );
  }

  useBoardSocket(boardId, {
    onUpsert: (card) =>
      setCardsByColumn((prev) => {
        const next: Record<number, Card[]> = {};
        for (const [key, cards] of Object.entries(prev)) {
          next[Number(key)] = cards.filter((c) => c.id !== card.id);
        }
        next[card.column] = [...(next[card.column] ?? []), card].sort(
          (a, b) => a.position - b.position,
        );
        return next;
      }),
    onDelete: handleCardDeleted,
    onColumnUpsert: upsertColumn,
    onColumnDelete: removeColumn,
    onReconnect: () => refetch(),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (error) {
    return <div className="p-6">Failed to load board: {String(error)}</div>;
  }

  if (!board) return null;

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={(event) => {
        setCardsByColumn((items) => move(items, event));
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#F6F5F1] px-7 py-6">
        <h1 className="mb-5 text-[18px] font-bold">{board.title}</h1>

        <div className="flex items-start gap-3.5">
          {columnMeta.map((meta) => (
            <KanbanColumn
              key={meta.id}
              id={meta.id}
              title={meta.title}
              cards={cardsByColumn[meta.id] ?? []}
              onRenamed={upsertColumn}
              onDeleted={removeColumn}
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
          <div className="min-w-0 flex-1">
            {newColumnTitle === null ? (
              <button
                type="button"
                onClick={() => setNewColumnTitle("")}
                className="cursor-pointer border-0 bg-transparent text-[12px] text-[#9A9D9F] hover:text-[#6B6F76]"
              >
                + Add column
              </button>
            ) : (
              <input
                autoFocus
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") setNewColumnTitle(null);
                }}
                placeholder="Column title"
                className="w-full rounded-[3px] border border-[#3D5BFF] bg-white px-2.5 py-2 text-[13px] outline-none"
              />
            )}
          </div>
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