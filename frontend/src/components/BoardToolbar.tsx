import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BoardMembers } from "./BoardMembers";

export function BoardToolbar({
  boardId,
  title,
  columnCount,
  cardCount,
  onAddColumn,
  onRename,
  onDelete,
  deleting,
  canEdit,
  isOwner,
}: {
  boardId: string;
  title: string;
  columnCount: number;
  cardCount: number;
  onAddColumn: (title: string) => Promise<boolean>;
  onRename: (title: string) => Promise<boolean>;
  onDelete: () => void;
  deleting: boolean;
  canEdit: boolean;
  isOwner: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const titleDoneRef = useRef(false);

  async function submit() {
    const next = draft.trim();
    if (!next) return;
    if (await onAddColumn(next)) {
      setDraft("");
      setAdding(false);
    }
  }

  function startEditingTitle() {
    titleDoneRef.current = false;
    setTitleDraft(title);
    setEditingTitle(true);
  }

  async function commitTitle() {
    if (titleDoneRef.current) return;
    titleDoneRef.current = true;
    const next = titleDraft.trim();
    setEditingTitle(false);
    if (!next || next === title) return;
    await onRename(next);
  }

  function cancelTitle() {
    titleDoneRef.current = true;
    setEditingTitle(false);
  }

  return (
    <div className="mb-5 flex items-center justify-between border-b border-[#DEDCD4] pb-4">
      <div>
        <Link to="/boards" className="text-[12px] text-[#6B6F76] hover:text-[#1C1F26]">
          ← Boards
        </Link>

        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            maxLength={150}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") cancelTitle();
            }}
            className="block w-72 max-w-full rounded-[3px] border border-[#3D5BFF] bg-white px-1.5 py-0.5 text-[18px] font-bold leading-tight outline-none"
          />
        ) : (
          <h1
            onDoubleClick={isOwner ? startEditingTitle : undefined}
            title={isOwner ? "Double-click to rename" : undefined}
            className="text-[18px] font-bold leading-tight"
          >
            {title}
          </h1>
        )}

        <p className="mt-0.5 text-[12px] text-[#6B6F76]">
          {columnCount} columns · {cardCount} cards
        </p>
      </div>

      <div className="flex items-center gap-2">
        {canEdit &&
          (adding ? (
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
          ))}

        <button
          type="button"
          onClick={() => setShowMembers(true)}
          className="cursor-pointer rounded-[3px] border border-[#DEDCD4] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1C1F26] hover:bg-[#ECEAE3]"
        >
          Members
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="cursor-pointer border-0 bg-transparent px-2 py-1.5 text-[12px] text-[#C0392B] disabled:cursor-default disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete board"}
          </button>
        )}

        <Link
          to="/account"
          className="px-2 py-1.5 text-[12px] text-[#6B6F76] hover:text-[#1C1F26]"
        >
          Account
        </Link>
      </div>

      {showMembers && (
        <BoardMembers
          boardId={boardId}
          isOwner={isOwner}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}