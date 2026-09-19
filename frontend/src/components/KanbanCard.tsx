import type { Card } from "#/lib/board-types";

export function KanbanCard({ card }: { card: Card }) {
    return (
        <div className="mb-2 rounded-[3px] border border-[#DEDCD4] bg-white px-3 pt-3 pb-2.75">
            <p className="text-[13px] font-medium text-[#1C1F26]">
                {card.title}
            </p>
        </div>
    );
}