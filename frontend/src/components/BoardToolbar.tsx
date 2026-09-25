import { useState } from "react";

export function BoardToolbar({
  title,
  columnCount,
  cardCount,
  onAddColumn,
}: {
  title: string;
  columnCount: number;
  cardCount: number;
  onAddColumn: (title: string) => Promise<boolean>;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  async function submit() {
    const next = draft.trim();
    if (!next) return;
    if (await onAddColumn(next)) {
      setDraft("");
      setAdding(false);
    }
  }

  return (
    <div className="mb-5 flex items-center justify-between border-b border-[#DEDCD4] pb-4">
      <div>
        <h1 className="text-[18px] font-bold leading-tight">{title}</h1>
        <p className="mt-0.5 text-[12px] text-[#6B6F76]">
          {columnCount} columns · {cardCount} cards
        </p>
      </div>

      <div className="flex items-center gap-2">
        {adding ? (
          <>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setDraft("");
                  setAdding(false);
                }
              }}
              placeholder="Column title"
              className="w-48 rounded-[3px] border border-[#3D5BFF] bg-white px-2.5 py-1.5 text-[13px] outline-none"
            />
            <button
              type="button"
              onClick={submit}
              className="cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-3 py-1.5 text-[12px] font-medium text-white"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setAdding(false);
              }}
              className="cursor-pointer border-0 bg-transparent px-1 py-1.5 text-[12px] text-[#6B6F76]"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="cursor-pointer rounded-[3px] border border-[#DEDCD4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1C1F26] hover:bg-[#ECEAE3]"
          >
            + Add column
          </button>
        )}
      </div>
    </div>
  );
}