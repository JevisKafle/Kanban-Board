import { useBoardQuery } from "#/features/board/queries";

export function KanbanBoard({ boardId }: { boardId: string }) {
    const { data: board, isLoading, error } = useBoardQuery(boardId)

    if (isLoading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (error) return <div style={{ padding: 24 }}>Failed to load board: {String(error)}</div>;
    if (!board) return null;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#F6F5F1", padding: "24px 28px" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{board.title}</h1>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                {board.columns.map((col) => (
                    <div key={col.id} style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>
                            {col.title} ({col.cards.length})
                        </div>
                        {col.cards.map((card) => (
                            <div
                                key={card.id}
                                style={{
                                    background: "#fff",
                                    border: "1px solid #DEDCD4",
                                    borderRadius: 3,
                                    padding: 10,
                                    marginBottom: 8,
                                    fontSize: 13,
                                }}
                            >
                                {card.title}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}