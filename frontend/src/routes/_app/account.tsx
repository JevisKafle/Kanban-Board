import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useMe, useLogout } from "#/features/auth/useAuth"

export const Route = createFileRoute('/_app/account')({
    component: AccountPage,
})

function AccountPage() {
    const { data: user } = useMe()
    const logout = useLogout()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout.mutateAsync()
        navigate({ to: "/login" })
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#F6F5F1] p-6">
            <div className="w-full max-w-sm rounded-md border border-[#DEDCD4] bg-white p-6">
                <h1 className="mb-4 text-[16px] font-semibold">Account</h1>
                <p className="text-[13px] text-[#1C1F26]">Username: {user?.username}</p>
                <p className="text-[13px] text-[#1C1F26]">Email: {user?.email}</p>

                <div className="mt-5 flex flex-col gap-2">
                    <Link
                        to="/boards"
                        className="rounded-[3px] border border-[#DEDCD4] bg-white px-3.5 py-2 text-center text-[13px] font-medium"
                    >
                        Back to board
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-3.5 py-2 text-[13px] font-medium text-white"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </div>
    )
}