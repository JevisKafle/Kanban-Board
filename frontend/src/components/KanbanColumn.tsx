import type { Column } from "#/lib/board-types";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({ column }: { column: Column }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex justify-between border-b border-[#DEDCD4] pb-2.5">
        <span className="text-[12px] font-semibold uppercase">
          {column.title}
        </span>

        <span className="text-[12px] text-[#9A9D9F]">
          {column.cards.length}
        </span>
      </div>

      {column.cards.map((card) => (
        <KanbanCard key={card.id} card={card} />
      ))}
    </div>
  );
}