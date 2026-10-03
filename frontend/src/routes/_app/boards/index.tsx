import { confirmAction } from '#/components/ConfirmDialog'
import { Logo } from '#/components/Logo'
import { Avatar } from '#/features/auth/Avatar'
import { useMe } from '#/features/auth/useAuth'
import {
  useBoardsQuery,
  useCreateBoard,
  useDeleteBoard,
} from '#/features/board/queries'
import type { BoardSummary } from '#/lib/board-types'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/boards/')({
  component: BoardListPage,
})

const ROLE_STYLE: Record<string, string> = {
  owner: 'bg-brand-50 text-brand-700',
  editor: 'bg-surface text-muted',
  viewer: 'bg-surface text-muted',
}

function BoardListPage() {
  const { data: boards, isLoading, error } = useBoardsQuery()
  const { data: user } = useMe()
  const createBoard = useCreateBoard()
  const deleteBoard = useDeleteBoard()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setFormError(null)
    try {
      const board = await createBoard.mutateAsync({ title: trimmed })
      setTitle('')
      navigate({ to: '/boards/$boardId', params: { boardId: String(board.id) } })
    } catch {
      setFormError("Couldn't create the board. Try again.")
    }
  }

  async function handleDelete(b: BoardSummary) {
    const ok = await confirmAction({
      title: `Delete "${b.title}"?`,
      message: "All of its columns and cards will be deleted. This can't be undone.",
      confirmLabel: 'Delete board',
    })
    if (!ok) return
    try {
      await deleteBoard.mutateAsync(b.id)
      toast.success('Board deleted')
    } catch {
      toast.error("Couldn't delete the board.")
    }
  }

  return (
    <div className="min-h-dvh bg-surface text-ink">
      {/* Top bar */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" aria-label="Kankan home">
            <Logo wordmark />
          </Link>
          <Link
            to="/account"
            aria-label="Account"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {user ? (
              <Avatar name={user.username} size="md" />
            ) : (
              <span className="block size-9 rounded-full bg-line" />
            )}
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">
            Your boards
          </h1>
          {boards && boards.length > 0 && (
            <p className="pb-1 text-[13px] text-muted">
              {boards.length} {boards.length === 1 ? 'board' : 'boards'}
            </p>
          )}
        </div>

        {/* Create */}
        <form onSubmit={handleCreate} className="mb-2 flex gap-2">
          <label htmlFor="new-board" className="sr-only">
            New board title
          </label>
          <input
            id="new-board"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name a new board"
            className="min-w-0 flex-1 rounded-lg border border-field bg-white px-3.5 py-3 text-base outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 hover:border-muted focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-600/15 sm:text-[14px]"
          />
          <button
            type="submit"
            disabled={createBoard.isPending || !title.trim()}
            className="cursor-pointer rounded-lg bg-brand-600 px-5 py-3 text-[14px] font-semibold whitespace-nowrap text-white transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-700 enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createBoard.isPending ? 'Creating…' : 'Create board'}
          </button>
        </form>
        <div className="mb-8 min-h-5">
          {formError && (
            <p role="alert" className="text-[12px] text-danger">
              {formError}
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/6 px-3.5 py-3 text-[13px] text-[#8e2a1f]">
            Failed to load boards. Refresh the page to try again.
          </p>
        )}

        {isLoading && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="h-32 animate-pulse rounded-[14px] border border-line bg-white motion-reduce:animate-none" />
            ))}
          </ul>
        )}

        {boards && boards.length === 0 && (
          <div className="rounded-[14px] border border-dashed border-field/60 bg-white px-6 py-14 text-center">
            <Logo className="mb-4" />
            <p className="text-[16px] font-semibold">No boards yet</p>
            <p className="mx-auto mt-1.5 max-w-[40ch] text-[14px] text-muted">
              Name your first board above to get started, or ask a board owner to add you to theirs.
            </p>
          </div>
        )}

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards?.map((b) => (
            <li key={b.id} className="group relative">
              <Link
                to="/boards/$boardId"
                params={{ boardId: String(b.id) }}
                className="flex h-32 flex-col justify-between rounded-[14px] border border-line bg-white p-5 transition-[transform,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[0_12px_24px_-16px_rgba(48,73,240,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-colors motion-reduce:hover:translate-y-0"
              >
                <p className="line-clamp-2 pr-14 text-[17px] leading-snug font-semibold tracking-[-0.01em]">
                  {b.title}
                </p>
                <span
                  className={`self-start rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${ROLE_STYLE[b.role] ?? ROLE_STYLE.viewer}`}
                >
                  {b.role}
                </span>
              </Link>

              {b.role === 'owner' && (
                <button
                  type="button"
                  onClick={() => handleDelete(b)}
                  disabled={deleteBoard.isPending}
                  className="absolute top-4 right-4 cursor-pointer rounded-md px-2 py-1 text-[12px] font-medium text-muted transition-colors duration-150 hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}