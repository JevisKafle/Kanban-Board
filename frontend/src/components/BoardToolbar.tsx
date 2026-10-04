import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Avatar } from "#/features/auth/Avatar";
import { useMe } from "#/features/auth/useAuth";
import { BoardMembers } from "./BoardMembers";

const btnBase =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";
const btnOutline = `${btnBase} border border-field/60 bg-white text-ink hover:bg-white/60`;
const btnPrimary = `${btnBase} bg-brand-600 text-white hover:bg-brand-700`;
const btnGhost = `${btnBase} text-muted hover:bg-line/60 hover:text-ink`;
const fieldCls =
  "rounded-lg border border-brand-600 bg-white text-ink outline-none ring-4 ring-brand-600/15";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

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
  const { data: me } = useMe();
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
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-4">
      <div className="min-w-0">
        <Link
          to="/boards"
          className="mb-1.5 inline-flex items-center gap-1 rounded-md text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 3 4.5 7l4 4" />
          </svg>
          Boards
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
            aria-label="Board title"
            className={`${fieldCls} block w-80 max-w-full px-2 py-0.5 text-[24px] leading-tight font-semibold tracking-[-0.02em]`}
          />
        ) : (
          <h1
            onDoubleClick={isOwner ? startEditingTitle : undefined}
            title={isOwner ? "Double-click to rename" : undefined}
            className="truncate text-[24px] leading-tight font-semibold tracking-[-0.02em] text-ink"
          >
            {title}
          </h1>
        )}

        <p className="mt-1 text-[13px] text-muted">
          {plural(columnCount, "column")}, {plural(cardCount, "card")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
                aria-label="Column title"
                className={`${fieldCls} w-48 px-3 py-2 text-[13px]`}
              />
              <button type="button" onClick={submit} className={btnPrimary}>
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  setAdding(false);
                }}
                className={btnGhost}
              >
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className={btnOutline}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 1.5v9M1.5 6h9" />
              </svg>
              Add column
            </button>
          ))}

        <button type="button" onClick={() => setShowMembers(true)} className={btnOutline}>
          Members
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={`${btnBase} text-danger hover:bg-danger/10`}
          >
            {deleting ? "Deleting…" : "Delete board"}
          </button>
        )}

        <Link
          to="/account"
          aria-label="Account"
          className="ml-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          {me ? (
            <Avatar name={me.username} size="md" />
          ) : (
            <span className="block size-9 rounded-full bg-line" />
          )}
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