import { KanbanBoard } from '#/components/KanbanBoard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div>
      <KanbanBoard boardId='1'/>
    </div>
  )
}
