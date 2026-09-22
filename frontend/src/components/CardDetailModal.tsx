import { useState, useEffect } from "react";
import type { Card } from "#/lib/board-types";
import { apiFetch } from "#/lib/api-client";

export function CardDetailModal({
  card,
  columnId,
  onClose,
  onSaved,
}: {
  card: Card | null;
  columnId: number;
  onClose: () => void;
  onSaved: (card: Card) => void;
}) {
  const isCreate = card === null;
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(card?.title ?? "");
    setDescription(card?.description ?? "");
  }, [card?.id]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);

    try {
      const saved = isCreate
        ? await apiFetch<Card>("/cards/", {
            method: "POST",
            body: JSON.stringify({
              column: columnId,
              title: trimmedTitle,
              description: description.trim(),
            }),
          })
        : await apiFetch<Card>(`/cards/${card.id}/`, {
            method: "PATCH",
            body: JSON.stringify({
              title: trimmedTitle,
              description: description.trim(),
            }),
          });

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(isCreate ? "Failed to create card:" : "Failed to update card:", err);
      alert("Failed to save. Check the console for details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,31,38,0.4)] backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="w-full max-w-[30rem] rounded-md border border-[#DEDCD4] bg-white p-6 shadow-[0_12px_32px_rgba(28,31,38,0.16)]"
      >
        <div className="mb-4 flex items-start justify-between">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title"
            className="mr-3 w-full border-0 text-[16px] font-semibold text-[#1C1F26] outline-none placeholder:text-[#9A9D9F]"
          />

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent p-0.5 text-[16px] leading-none text-[#9A9D9F]"
          >
            ✕
          </button>
        </div>

        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B6F76]">
          Description
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={6}
          className="w-full resize-y rounded-[3px] border border-[#DEDCD4] px-2.75 py-2.5 text-[13px] text-[#1C1F26] outline-none"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer border-0 bg-transparent px-2.5 py-1.5 text-[12px] font-normal text-[#6B6F76]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className={`rounded-[3px] border-0 bg-[#1C1F26] px-3.5 py-1.5 text-[12px] font-medium text-white ${
              saving || !title.trim() ? "cursor-default opacity-60" : "cursor-pointer"
            }`}
          >
            {saving ? "Saving..." : isCreate ? "Add card" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
