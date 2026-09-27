import { useSortable } from "@dnd-kit/react/sortable";
import type { Card } from "#/lib/board-types";

export function KanbanCard({
    card,
    index,
    columnId,
    onOpen,
    canEdit
}: {
    card: Card;
    index: number;
    columnId: number;
    onOpen: (card: Card) => void;
    canEdit: boolean;
    }) {
    const { ref, isDragging } = useSortable({
        id: `card-${card.id}`,
        index,
        group: columnId,
    });

    return (
        <div
            ref={ref}
            onClick={() => onOpen(card)}
            className={`rounded-[3px] border border-[#DEDCD4] bg-white px-3 pt-3 pb-2.75 ${canEdit ? "cursor-grab" : "cursor-pointer"
                } ${isDragging ? "opacity-40" : "opacity-100"}`}
        >
            <p className="text-[13px] font-medium text-[#1C1F26]">{card.title}</p>

            {card.description && (
                <p className="mt-1.5 line-clamp-2 text-[12px] leading-4 text-[#6B6F76]">
                    {card.description}
                </p>
            )}
        </div>
    );
}