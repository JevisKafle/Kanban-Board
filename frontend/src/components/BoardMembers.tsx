import { useState } from "react";
import { useBoardMembers, useAddMember } from "#/features/board/queries";

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
    const addMember = useAddMember(boardId);
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("editor");
    const [error, setError] = useState<string | null>(null);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await addMember.mutateAsync({ username: username.trim(), role });
            setUsername("");
        } catch (err: any) {
            setError(err?.body?.username?.[0] ?? "Could not add member.");
        }
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,31,38,0.4)] backdrop-blur-[2px]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
                className="w-full max-w-md rounded-md border border-[#DEDCD4] bg-white p-6 shadow-[0_12px_32px_rgba(28,31,38,0.16)]"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[16px] font-semibold">
                        Members{members ? ` (${members.length})` : ""}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer border-0 bg-transparent p-0.5 text-[16px] leading-none text-[#9A9D9F]"
                    >
                        ✕
                    </button>
                </div>

                <ul className="mb-4 max-h-64 divide-y divide-[#EEEDE7] overflow-y-auto">
                    {isLoading && <li className="py-2 text-[13px] text-[#9A9D9F]">Loading...</li>}
                    {members?.map((m) => (
                        <li key={m.id} className="flex items-center justify-between py-2 text-[13px]">
                            <span className="font-medium">{m.username}</span>
                            <span className="rounded-full bg-[#F6F5F1] px-2 py-0.5 text-[11px] uppercase text-[#6B6F76]">
                                {m.role}
                            </span>
                        </li>
                    ))}
                </ul>

                {isOwner ? (
                    <form onSubmit={handleAdd}>
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6F76]">
                            Add member
                        </div>
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="min-w-0 flex-1 rounded-[3px] border border-[#DEDCD4] px-2.5 py-1.5 text-[13px] outline-none focus:border-[#3D5BFF]"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="rounded-[3px] border border-[#DEDCD4] px-2 py-1.5 text-[13px] outline-none"
                            >
                                <option value="editor">Editor</option>
                                <option value="viewer">Viewer</option>
                            </select>
                            <button
                                type="submit"
                                disabled={addMember.isPending || !username.trim()}
                                className="cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-3 py-1.5 text-[12px] font-medium text-white disabled:cursor-default disabled:opacity-60"
                            >
                                Add
                            </button>
                        </div>
                        {error && <p className="mt-2 text-[12px] text-[#C0392B]">{error}</p>}
                    </form>
                ) : (
                    <p className="text-[12px] text-[#9A9D9F]">Only the board owner can add members.</p>
                )}
            </div>
        </div>
    );
}