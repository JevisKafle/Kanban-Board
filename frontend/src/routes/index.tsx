import { createFileRoute, Link } from '@tanstack/react-router'
import { useMe } from "#/features/auth/useAuth"

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { data: user, isLoading } = useMe()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F6F5F1]">
      <h1 className="text-[22px] font-bold">Kanban Board</h1>

      {isLoading ? null : user ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[13px] text-[#6B6F76]">Signed in as {user.username}</p>
          <Link
            to="/boards"
            className="rounded-[3px] bg-[#1C1F26] px-4 py-2 text-[13px] font-medium text-white"
          >
            Go to board
          </Link>
          <Link to="/account" className="text-[12px] text-[#3D5BFF]">
            Account
          </Link>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-[3px] border border-[#DEDCD4] bg-white px-4 py-2 text-[13px] font-medium"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-[3px] bg-[#1C1F26] px-4 py-2 text-[13px] font-medium text-white"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  )
}