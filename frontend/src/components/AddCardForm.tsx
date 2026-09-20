import { useState } from "react";

export function AddCardForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (title: string) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = title.trim()
        onSubmit(trimmed)
        setTitle("")
    }

    return (
        <form onSubmit={handleSubmit} className="mt-1">
            <textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                    }

                    if (e.key === "Escape") {
                        onCancel()
                    }
                }}
                placeholder="Card title.."
                rows={2}
                className="w-full resize-none rounded-[3px] border border-[#3D5BFF] bg-white px-2.75 py-2.5 text-[13px] text-[#1C1F26] outline-none"
            />

            <div className="mt-1.5 flex gap-2">
                <button
                    className="cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-2.75 py-1.25 text-[12px] font-medium text-white "
                    type="submit"
                >
                    Add card
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="cursor-pointer border-0 bg-transparent px-1 py-1.25 text-[12px] font-normal text-[#6B6F76]"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}