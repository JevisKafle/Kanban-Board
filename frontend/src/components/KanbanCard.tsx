import { useSortable } from "@dnd-kit/react/sortable";
import type { Card } from "#/lib/board-types";

export function KanbanCard({
    card,
    index,
    columnId,
    onOpen,
}: {
    card: Card;
    index: number;
    columnId: number;
    onOpen: (card: Card) => void;
}) {
    const { ref, isDragging } = useSortable({ id: card.id, index, group: columnId });

    return (
        <div
            ref={ref}
            onClick={() => onOpen(card)}
            className={`mb-2 cursor-grab rounded-[3px] border border-[#DEDCD4] bg-white px-3 pt-3 pb-2.75 ${isDragging ? "opacity-40" : "opacity-100"
                }`}
        >
            <p className="text-[13px] font-medium text-[#1C1F26]">{card.title}</p>
        </div>
    );
}