import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
    useBoardMembers,
    useAddMember,
    useRemoveMember,
} from "#/features/board/queries";
import { useMe } from "#/features/auth/useAuth";
import { Avatar } from "#/features/auth/Avatar";
import type { Membership } from "#/lib/board-types";
import { confirmAction } from "./ConfirmDialog";

const fieldCls =
    "rounded-lg border border-field bg-white px-3.5 py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-muted focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-600/15 sm:text-[14px]";

export function BoardMembers({
    boardId,
    isOwner,
    onClose,
}: {
    boardId: string;
    isOwner: boolean;
    onClose: () => void;
}) {
    const { data: members, isLoading } = useBoardMembers(boardId);
    const { data: me } = useMe();
    const addMember = useAddMember(boardId);
    const removeMember = useRemoveMember(boardId);
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("editor");
    const [error, setError] = useState<string | null>(null);

    // Escape closes the modal wherever focus is.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await addMember.mutateAsync({ username: username.trim(), role });
            toast.success(`Added ${username.trim()} as ${role}`);
            setUsername("");
        } catch (err: any) {
            setError(err?.body?.username?.[0] ?? "Could not add member.");
        }
    }

    async function handleRemove(m: Membership) {
        const isSelf = m.user === me?.id;
        const ok = await confirmAction(
            isSelf
                ? {
                    title: "Leave this board?",
                    message: "You'll lose access until the owner adds you again.",
                    confirmLabel: "Leave board",
                }
                : {
                    title: `Remove ${m.username}?`,
                    message: "They'll lose access to this board immediately.",
                    confirmLabel: "Remove",
                },
        );
        if (!ok) return;

        try {
            await removeMember.mutateAsync(m.id);
            if (isSelf) {
                toast.success("You left the board");
                navigate({ to: "/boards" });
            } else {
                toast.success(`Removed ${m.username}`);
            }
        } catch (err) {
            console.error("Failed to remove member:", err);
            toast.error(
                isSelf ? "Couldn't leave the board." : `Couldn't remove ${m.username}.`,
            );
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px] transition-opacity duration-200 ease-out starting:opacity-0"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="members-title"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-115 rounded-2xl border border-line bg-white p-6 shadow-[0_24px_48px_-16px_rgba(20,23,43,0.35)] transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-95 starting:opacity-0 motion-reduce:transition-none"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="members-title" className="text-[20px] font-semibold tracking-[-0.015em] text-ink">
                        Members
                        {members && (
                            <span className="ml-2 text-[14px] font-medium text-muted">{members.length}</span>
                        )}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                        <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                            <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                        </svg>
                    </button>
                </div>

                <ul className="mb-5 max-h-72 divide-y divide-line overflow-y-auto">
                    {isLoading && <li className="py-3 text-[13px] text-muted">Loading...</li>}
                    {members?.map((m) => {
                        const isSelf = m.user === me?.id;
                        const canRemove = m.role !== "owner" && (isOwner || isSelf);
                        return (
                            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar name={m.username} size="md" />
                                    <span className="truncate text-[14px] font-medium text-ink">
                                        {m.username}
                                        {isSelf && (
                                            <span className="ml-1.5 text-[12px] font-normal text-muted">(you)</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${m.role === "owner" ? "bg-brand-50 text-brand-700" : "bg-surface text-muted"
                                            }`}
                                    >
                                        {m.role}
                                    </span>
                                    {canRemove && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(m)}
                                            disabled={removeMember.isPending}
                                            className="cursor-pointer rounded-md px-2 py-1 text-[12px] font-medium text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSelf ? "Leave" : "Remove"}
                                        </button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {isOwner ? (
                    <form onSubmit={handleAdd} className="border-t border-line pt-5">
                        <label htmlFor="member-username" className="mb-1.5 block text-[13px] font-medium text-ink">
                            Add a member
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <input
                                id="member-username"
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                className={`${fieldCls} min-w-40 flex-1`}
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                aria-label="Role"
                                className={`${fieldCls} cursor-pointer`}
                            >
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <button
                                type="submit"
                                disabled={addMember.isPending || !username.trim()}
                                className="cursor-pointer rounded-lg bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-700 enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {addMember.isPending ? "Adding…" : "Add"}
                            </button>
                        </div>
                        {error && (
                            <p role="alert" className="mt-2 text-[12px] text-danger">
                                {error}
                            </p>
                        )}
                    </form>
                ) : (
                    <p className="border-t border-line pt-4 text-[13px] text-muted">
                        Only the board owner can add members.
                    </p>
                )}
            </div>
        </div>
    );
}