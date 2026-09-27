import { createFileRoute, redirect } from '@tanstack/react-router'
import { KanbanBoard } from "#/components/KanbanBoard";
import { fetchMe } from '#/features/auth/auth';

export const Route = createFileRoute('/boards/$boardId')({
    beforeLoad: async () => {
        try {
            await fetchMe();
        }
        catch {
            throw redirect({ to: "/login" })
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { boardId } = Route.useParams();
    return <KanbanBoard boardId={boardId} />;
}
