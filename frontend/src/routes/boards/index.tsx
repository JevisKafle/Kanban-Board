import { fetchMe } from '#/features/auth/auth'
import {
  useBoardsQuery,
  useCreateBoard,
  useDeleteBoard,
} from '#/features/board/queries'
import type { BoardSummary } from '#/lib/board-types'
import { createFileRoute, redirect, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'


export const Route = createFileRoute('/boards/')({
  beforeLoad: async () => {
    try {
      await fetchMe()
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: BoardListPage,
})

function BoardListPage() {
  const { data: boards, isLoading, error } = useBoardsQuery()
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
    if (
      !confirm(
        `Delete "${b.title}" and all of its columns and cards? This can't be undone.`,
      )
    )
      return
    setFormError(null)
    try {
      await deleteBoard.mutateAsync(b.id)
    } catch {
      setFormError("Couldn't delete the board. Try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F5F1] px-7 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between border-b border-[#DEDCD4] pb-4">
          <h1 className="text-[18px] font-bold">Your boards</h1>
          <Link to="/account" className="text-[12px] text-[#6B6F76] hover:text-[#1C1F26]">
            Account
          </Link>
        </div>

        <form onSubmit={handleCreate} className="mb-6 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New board title"
            className="min-w-0 flex-1 rounded-[3px] border border-[#DEDCD4] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#3D5BFF]"
          />
          <button
            type="submit"
            disabled={createBoard.isPending || !title.trim()}
            className="cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-4 py-2 text-[12px] font-medium text-white disabled:cursor-default disabled:opacity-60"
          >
            {createBoard.isPending ? 'Creating...' : 'Create board'}
          </button>
        </form>
        {formError && <p className="-mt-4 mb-4 text-[12px] text-[#C0392B]">{formError}</p>}

        {isLoading && <p className="text-[13px] text-[#9A9D9F]">Loading...</p>}
        {error && <p className="text-[13px] text-[#C0392B]">Failed to load boards.</p>}

        {boards && boards.length === 0 && (
          <p className="text-[13px] text-[#6B6F76]">
            You don't have any boards yet. Create one above, or ask a board owner to add you.
          </p>
        )}

        <ul className="grid gap-3 sm:grid-cols-2">
          {boards?.map((b) => (
            <li key={b.id} className="relative">
              <Link
                to="/boards/$boardId"
                params={{ boardId: String(b.id) }}
                className="block rounded-md border border-[#DEDCD4] bg-white p-4 pr-16 hover:border-[#3D5BFF]"
              >
                <p className="text-[14px] font-semibold text-[#1C1F26]">{b.title}</p>
                <span className="mt-2 inline-block rounded-full bg-[#F6F5F1] px-2 py-0.5 text-[11px] uppercase text-[#6B6F76]">
                  {b.role}
                </span>
              </Link>

              {b.role === 'owner' && (
                <button
                  type="button"
                  onClick={() => handleDelete(b)}
                  disabled={deleteBoard.isPending}
                  className="absolute right-3 top-3 cursor-pointer border-0 bg-transparent p-0 text-[11px] text-[#9A9D9F] hover:text-[#C0392B] disabled:cursor-default disabled:opacity-60"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}