import { useSortable } from "@dnd-kit/react/sortable";
import type { Card } from "#/lib/board-types";

export function KanbanCard({
    card,
    index,
    columnId,
    onOpen,
    canEdit,
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
        type: "card",
        accept: "card",
        disabled: !canEdit,
    });

    return (
        <div
            ref={canEdit ? ref : undefined}
            onClick={() => onOpen(card)}
            className={`rounded-[10px] border border-line bg-white p-3 shadow-[0_1px_2px_rgba(20,23,43,0.04)] transition-[border-color,box-shadow,opacity] duration-150 hover:border-brand-400 hover:shadow-[0_6px_14px_-8px_rgba(48,73,240,0.4)] ${canEdit ? "cursor-grab" : "cursor-pointer"
                } ${isDragging ? "opacity-40" : "opacity-100"}`}
        >
            <p className="text-[14px] leading-snug font-medium text-ink">{card.title}</p>

            {card.description && (
                <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.45] text-muted">
                    {card.description}
                </p>
            )}
        </div>
    );
}