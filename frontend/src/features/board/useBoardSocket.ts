import { useEffect, useRef } from "react";
import type { Card, Column } from "#/lib/board-types";

type Handlers = {
  onUpsert: (card: Card) => void; // update + insert
  onDelete: (cardId: number) => void;
  onColumnUpsert: (column: Column) => void;
  onColumnDelete: (columnId: number) => void;
  onBoardUpdate: (title: string) => void;
  onBoardDelete: () => void;
  onReconnect: () => void;
};

export function useBoardSocket(boardId: string | number, handlers: Handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;
    let closedByUs = false;
    let hadConnection = false;
    let attempt = 0;

    function connect() {
      ws = new WebSocket(`ws://localhost:8000/ws/boards/${boardId}/`);

      ws.onopen = () => {
        if (hadConnection) ref.current.onReconnect();
        hadConnection = true;
        attempt = 0;
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "card.created" || msg.type === "card.updated") {
          ref.current.onUpsert(msg.card);
        } else if (msg.type === "card.deleted") {
          ref.current.onDelete(msg.card_id);
        } else if (
          msg.type === "column.created" ||
          msg.type === "column.updated"
        ) {
          ref.current.onColumnUpsert(msg.column);
        } else if (msg.type === "column.deleted") {
          ref.current.onColumnDelete(msg.column_id);
        } else if (msg.type === "board.updated") {
          ref.current.onBoardUpdate(msg.title);
        } else if (msg.type === "board.deleted") {
          ref.current.onBoardDelete();
        }
      };

      ws.onclose = () => {
        if (closedByUs) return;
        const delay = Math.min(1000 * 2 ** attempt++, 15000);
        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();
    return () => {
      closedByUs = true;
      clearTimeout(retryTimer);
      ws?.close();
    };
  }, [boardId]);
}
