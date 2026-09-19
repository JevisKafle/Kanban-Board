import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "#/lib/api-client";
import type { Board } from "#/lib/board-types";

export function useBoardQuery(boardId: string | number) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => apiFetch<Board>(`/boards/${boardId}`),
  });
}
