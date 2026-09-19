import { useBoardQuery } from "#/features/board/queries";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard({ boardId }: { boardId: string }) {
  const { data: board, isLoading, error } = useBoardQuery(boardId);

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
    <div className="min-h-screen bg-[#F6F5F1] px-7 py-6">
      <h1 className="mb-5 text-[18px] font-bold">
        {board.title}
      </h1>

      <div className="flex items-start gap-3.5">
        {board.columns.map((col) => (
          <KanbanColumn key={col.id} column={col} />
        ))}
      </div>
    </div>
  );
}