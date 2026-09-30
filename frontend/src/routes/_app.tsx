import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { fetchMe } from '#/features/auth/auth'

export const Route = createFileRoute('/_app')({
  ssr: false,
  beforeLoad: async () => {
    try {
      await fetchMe()
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: Outlet,
})