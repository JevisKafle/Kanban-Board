import { createFileRoute } from '@tanstack/react-router'
import { KanbanBoard } from "#/components/KanbanBoard";

export const Route = createFileRoute('/_app/boards/$boardId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { boardId } = Route.useParams();
    return <KanbanBoard boardId={boardId} />;
}