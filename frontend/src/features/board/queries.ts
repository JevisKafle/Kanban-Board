import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "#/lib/api-client";
import type { Board, Card } from "#/lib/board-types";

export function useBoardQuery(boardId: string | number) {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => apiFetch<Board>(`/boards/${boardId}`),
  });
}

export function useCreateCard() {
  return useMutation({
    mutationFn: (payload: {
      column: number;
      title: string;
      description: string;
    }) =>
      apiFetch<Card>("/cards/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useUpdateCard() {
  return useMutation({
    mutationFn: (payload: {
      id: number;
      title: string;
      description: string;
    }) =>
      apiFetch<Card>(`/cards/${payload.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
        }),
      }),
  });
}
