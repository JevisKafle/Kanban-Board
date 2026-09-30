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
  board: string;
  title: string;
  position: number;
  is_done_column: boolean;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  owner: number;
  columns: Column[];
  role: "owner" | "editor" | "viewer";
}

export interface Membership {
  id: number;
  board: string;
  user: number;
  username: string;
  role: "owner" | "editor" | "viewer";
}

export interface BoardSummary {
  id: string;
  title: string;
  owner: number;
  role: "owner" | "editor" | "viewer";
}
