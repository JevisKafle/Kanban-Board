export interface Card {
  id: number;
  column: number;
  title: string;
  description: string;
  position: number;
  owner: number | null;
  updated_at: string;
}

export interface Column {
  id: number;
  board: number;
  title: string;
  position: number;
  is_done_column: boolean;
  cards: Card[];
}

export interface Board {
  id: number;
  title: string;
  owner: number;
  columns: Column[];
  role: "owner" | "editor" | "viewer";
}

export interface Membership {
  id: number;
  board: number;
  user: number;
  username: string;
  role: "owner" | "editor" | "viewer";
}

export interface BoardSummary {
  id: number;
  title: string;
  owner: number;
  role: "owner" | "editor" | "viewer";
}
