import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import type { Card } from "#/lib/board-types";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  id,
  title,
  cards,
  onAddCard,
  onOpenCard,
}: {
  id: number;
  title: string;
  cards: Card[];
  onAddCard: () => void;
  onOpenCard: (card: Card) => void;
}) {
  const { ref } = useDroppable({
    id,
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-3 flex justify-between border-b border-[#DEDCD4] pb-2.5">
        <span className="text-[12px] font-semibold uppercase">
          {title}
        </span>

        <span className="text-[12px] text-[#9A9D9F]">
          {cards.length}
        </span>
      </div>

      <div
        ref={ref}
        className="flex min-h-5 flex-1 flex-col gap-2"
      >
        {cards.map((card, index) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={index}
            columnId={id}
            onOpen={onOpenCard}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCard}
        className="mt-3.5 cursor-pointer border-0 bg-transparent px-0 py-0.5 text-left text-[12px] font-normal text-[#9A9D9F] transition-colors duration-150 hover:text-[#6B6F76]"
      >
        + Add card
      </button>
    </div>
  );
}
