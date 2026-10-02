import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useMe, useLogout } from '#/features/auth/useAuth'
import { Avatar } from '#/features/auth/Avatar'

export const Route = createFileRoute('/_app/account')({
    component: AccountPage,
})

function AccountPage() {
    const { data: user } = useMe()
    const logout = useLogout()
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await logout.mutateAsync()
            navigate({ to: '/login' })
        } catch {
            toast.error("Couldn't log out. Try again.")
        }
    }

    return (
        <div className="min-h-dvh bg-surface px-4 py-8 sm:py-14">
            <main className="mx-auto w-full max-w-120">
                <h1 className="sr-only">Account</h1>

                <section className="overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_1px_2px_rgba(20,23,43,0.04)]">
                    {/* Brand band, same rings as the login panel */}
                    <div className="relative h-28 overflow-hidden bg-brand-600">
                        <div
                            aria-hidden="true"
                            className="absolute -top-28 -right-16 size-64 rounded-full border border-white/10"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute -top-16 -right-4 size-44 rounded-full border border-white/10"
                        />
                        <div
                            aria-hidden="true"
                            className="absolute -bottom-32 -left-12 size-64 rounded-full border border-white/10"
                        />
                    </div>

                    <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                        {/* Identity */}
                        <div className="relative -mt-10">
                            {user ? (
                                <Avatar name={user.username} size="lg" className="ring-4 ring-white" />
                            ) : (
                                <div className="size-20 animate-pulse rounded-full bg-line ring-4 ring-white motion-reduce:animate-none" />
                            )}
                        </div>

                        <div className="mt-4 min-w-0">
                            {user ? (
                                <>
                                    <p className="truncate text-[22px] leading-tight font-semibold tracking-[-0.015em] text-ink">
                                        {user.username}
                                    </p>
                                    <p className="mt-1 truncate text-[14px] text-muted">
                                        {user.email}
                                    </p>
                                </>
                            ) : (
                                <div className="space-y-2.5" aria-busy="true">
                                    <div className="h-6 w-36 animate-pulse rounded-[5px] bg-line motion-reduce:animate-none" />
                                    <div className="h-4 w-52 animate-pulse rounded-[5px] bg-line motion-reduce:animate-none" />
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 grid gap-2.5 border-t border-line pt-6 sm:grid-cols-2">
                            <Link
                                to="/boards"
                                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-3 text-[14px] font-semibold text-white transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                            >
                                Back to boards
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={logout.isPending}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-field/60 bg-white px-4 py-3 text-[14px] font-semibold text-ink transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-surface enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {logout.isPending && (
                                    <span
                                        aria-hidden="true"
                                        className="size-3.5 animate-spin rounded-full border-2 border-ink/25 border-t-ink [animation-duration:700ms] motion-reduce:animate-none"
                                    />
                                )}
                                {logout.isPending ? 'Logging out…' : 'Log out'}
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}