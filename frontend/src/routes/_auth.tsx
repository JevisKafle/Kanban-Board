import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { fetchMe } from '#/features/auth/auth'

export const Route = createFileRoute('/_auth')({
  ssr: false,
  beforeLoad: async () => {
    try {
      await fetchMe()
    } catch {
      return
    }
    throw redirect({ to: '/' })
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F5F1]">
      <div className="w-full max-w-80 rounded-md border border-[#DEDCD4] bg-white p-6">
        <Outlet />
      </div>
    </div>
  )
}