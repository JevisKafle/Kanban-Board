import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "#/lib/api-client";
import {
  type Column,
  type Board,
  type Card,
  type Membership,
  type BoardSummary,
} from "#/lib/board-types";

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

export function useRenameBoard(boardId: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (title: string) =>
      apiFetch<Board>(`/boards/${boardId}/`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useDeleteBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/boards/${id}/`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

export function useUpdateCard() {
  return useMutation({
    mutationFn: (payload: { id: number; title: string; description: string }) =>
      apiFetch<Card>(`/cards/${payload.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: payload.title,
          description: payload.description,
        }),
      }),
  });
}

export function useDeleteCard() {
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/cards/${id}/`, { method: "DELETE" }),
  });
}

export function useMoveCard(boardId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      cardId: number;
      column: number;
      before_id: number | null;
      after_id: number | null;
    }) =>
      apiFetch<Card>(`/cards/${payload.cardId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          column: payload.column,
          before_id: payload.before_id,
          after_id: payload.after_id,
        }),
      }),
    onError: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}

//column
export function useCreateColumn() {
  return useMutation({
    mutationFn: (payload: { board: string; title: string }) =>
      apiFetch<Column>("/columns/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

export function useRenameColumn() {
  return useMutation({
    mutationFn: (payload: { id: number; title: string }) =>
      apiFetch<Column>(`/columns/${payload.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ title: payload.title }),
      }),
  });
}

export function useDeleteColumn() {
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/columns/${id}/`, { method: "DELETE" }),
  });
}

export function useMoveColumn(boardId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      columnId: number;
      before_id: number | null;
      after_id: number | null;
    }) =>
      apiFetch<Column>(`/columns/${payload.columnId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          before_id: payload.before_id,
          after_id: payload.after_id,
        }),
      }),
    onError: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId] });
    },
  });
}

//memberships
export function useBoardMembers(boardId: string | number) {
  return useQuery({
    queryKey: ["board", boardId, "members"],
    queryFn: () => apiFetch<Membership[]>(`/boards/${boardId}/members/`),
  });
}

export function useAddMember(boardId: string | number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username: string; role: string }) =>
      apiFetch<Membership>(`/boards/${boardId}/members/`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId, "members"] });
    },
  });
}

export function useRemoveMember(boardId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: number) =>
      apiFetch<void>(`/boards/${boardId}/members/${membershipId}/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board", boardId, "members"] });
      qc.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

//board
export function useBoardsQuery() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () => apiFetch<BoardSummary[]>("/boards/"),
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string }) =>
      apiFetch<Board>("/boards/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}
