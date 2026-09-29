import { useState, useEffect, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import {
  useBoardQuery,
  useCreateColumn,
  useMoveCard,
  useMoveColumn,
} from "#/features/board/queries";
import type { Card, Column } from "#/lib/board-types";
import { KanbanColumn } from "./KanbanColumn";
import { CardDetailModal } from "./CardDetailModal";
import { useBoardSocket } from "#/features/board/useBoardSocket";
import { BoardToolbar } from "./BoardToolbar";

type ColumnMeta = Omit<Column, "cards">;

function findCard(cols: Record<number, Card[]>, cardId: number) {
  for (const [colId, cards] of Object.entries(cols)) {
    const index = cards.findIndex((c) => c.id === cardId);
    if (index !== -1) return { columnId: Number(colId), index, cards };
  }
  return null;
}

export function KanbanBoard({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error, refetch } = useBoardQuery(boardId);

  const [columnMeta, setColumnMeta] = useState<ColumnMeta[]>([]);
  const [cardsByColumn, setCardsByColumn] = useState<Record<number, Card[]>>({});
  const [openCard, setOpenCard] = useState<Card | null>(null);
  const [addingToColumnId, setAddingToColumnId] = useState<number | null>(null);

  const createColumn = useCreateColumn();
  const moveCard = useMoveCard(boardId);
  const moveColumn = useMoveColumn(boardId);

  const canEdit = board?.role === "owner" || board?.role === "editor";

  const cardsRef = useRef(cardsByColumn);
  cardsRef.current = cardsByColumn;
  const columnsRef = useRef(columnMeta);
  columnsRef.current = columnMeta;

  // Non-null while a drag is in progress. Also blocks the board->state sync
  // effect below so a mid-drag refetch can't clobber local state.
  const snapshotRef = useRef<Record<number, Card[]> | null>(null);
  const columnSnapshotRef = useRef<ColumnMeta[] | null>(null);

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
    setColumnMeta((prev) => {
      const next = prev.some((c) => c.id === meta.id)
        ? prev.map((c) => (c.id === meta.id ? meta : c))
        : [...prev, meta];
      // Re-sort so a reorder made by another user shows up here too. Skip
      // while dragging: local order is ahead of the server's positions.
      return snapshotRef.current
        ? next
        : next.sort((a, b) => a.position - b.position);
    });
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

  async function handleAddColumn(title: string) {
    if (!board) return false;
    try {
      upsertColumn(await createColumn.mutateAsync({ board: board.id, title }));
      return true;
    } catch (err) {
      console.error("Failed to add column:", err);
      alert("Failed to add column.");
      return false;
    }
  }

  function parseId(id: unknown) {
    const [kind, num] = String(id).split("-");
    return { kind, id: Number(num) };
  }

  function handleDragOver(event: any) {
    const { source, target } = event.operation;
    if (!source || !target) return;
    const s = parseId(source.id);
    const t = parseId(target.id);

    if (s.kind === "col") {
      if (t.kind !== "col" || s.id === t.id) return;
      setColumnMeta((prev) => {
        const from = prev.findIndex((c) => c.id === s.id);
        const to = prev.findIndex((c) => c.id === t.id);
        if (from === -1 || to === -1 || from === to) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
      return;
    }

    if (s.kind !== "card") return;

    setCardsByColumn((prev) => {
      const from = findCard(prev, s.id);
      if (!from) return prev;

      let toCol: number;
      let toIndex: number;
      if (t.kind === "col") {
        // Dropped on a column itself (empty area or empty column): append.
        toCol = t.id;
        if (from.columnId === toCol) return prev;
        toIndex = (prev[toCol] ?? []).length;
      } else {
        const to = findCard(prev, t.id);
        if (!to) return prev;
        toCol = to.columnId;
        toIndex = to.index;
        if (from.columnId === toCol && from.index === toIndex) return prev;
      }

      const card = prev[from.columnId][from.index];
      const without = prev[from.columnId].filter((c) => c.id !== s.id);

      if (from.columnId === toCol) {
        const arr = [...without];
        arr.splice(toIndex, 0, card);
        return { ...prev, [toCol]: arr };
      }
      const dest = [...(prev[toCol] ?? [])];
      dest.splice(toIndex, 0, { ...card, column: toCol });
      return { ...prev, [from.columnId]: without, [toCol]: dest };
    });
  }

  function handleDragStart() {
    if (!canEdit) return;
    snapshotRef.current = cardsRef.current;
    columnSnapshotRef.current = columnsRef.current;
  }

  function handleDragEnd(event: any) {
    const snapshot = snapshotRef.current;
    const columnSnapshot = columnSnapshotRef.current;
    snapshotRef.current = null;
    columnSnapshotRef.current = null;

    if (!canEdit) {
      if (snapshot) setCardsByColumn(snapshot);
      if (columnSnapshot) setColumnMeta(columnSnapshot);
      return;
    }
    if (!snapshot) return;

    if (event.canceled) {
      setCardsByColumn(snapshot);
      if (columnSnapshot) setColumnMeta(columnSnapshot);
      return;
    }

    const source = event.operation.source;
    if (!source) return;
    const src = parseId(source.id);

    if (src.kind === "col") {
      const order = columnsRef.current;
      const index = order.findIndex((c) => c.id === src.id);
      const originalIndex =
        columnSnapshot?.findIndex((c) => c.id === src.id) ?? -1;
      if (index === -1 || index === originalIndex) return;

      moveColumn.mutate(
        {
          columnId: src.id,
          before_id: order[index - 1]?.id ?? null,
          after_id: order[index + 1]?.id ?? null,
        },
        {
          // Pull the server's new position into local state.
          onSuccess: (saved) => upsertColumn(saved),
          onError: () => {
            if (columnSnapshot) setColumnMeta(columnSnapshot);
          },
        },
      );
      return;
    }

    const cardId = src.id;
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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#F6F5F1] px-7 py-6">
        <BoardToolbar
          boardId={boardId}
          title={board.title}
          columnCount={columnMeta.length}
          cardCount={Object.values(cardsByColumn).reduce((n, c) => n + c.length, 0)}
          onAddColumn={handleAddColumn}
          canEdit={canEdit}
          isOwner={board.role === "owner"}
        />

        <div className="flex items-start gap-3.5">
          {columnMeta.map((meta, index) => (
            <KanbanColumn
              key={meta.id}
              id={meta.id}
              index={index}
              title={meta.title}
              cards={cardsByColumn[meta.id] ?? []}
              onRenamed={upsertColumn}
              onDeleted={removeColumn}
              canEdit={canEdit}
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
            canEdit={canEdit}
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