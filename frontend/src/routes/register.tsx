import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useRegister } from '#/features/auth/useAuth'

export const Route = createFileRoute('/register')({
    component: RouteComponent,
})

function RouteComponent() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const register = useRegister()
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            await register.mutateAsync({ username, email, password })
            navigate({ to: '/boards' })
        } catch (err) {
            console.error(err)
            setError('Could not register. Check your details and try again.')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F6F5F1]">
            <form onSubmit={handleSubmit} className="w-full max-w-80 rounded-md border border-[#DEDCD4] bg-white p-6">
                <h1 className="mb-4 text-[16px] font-semibold">Create an account</h1>

                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="mb-2 w-full rounded-[3px] border border-[#DEDCD4] px-2.75 py-2 text-[13px] outline-none"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="mb-2 w-full rounded-[3px] border border-[#DEDCD4] px-2.75 py-2 text-[13px] outline-none"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="mb-3 w-full rounded-[3px] border border-[#DEDCD4] px-2.75 py-2 text-[13px] outline-none"
                />

                {error && <p className="mb-3 text-[12px] text-[#C0392B]">{error}</p>}

                <button
                    type="submit"
                    disabled={register.isPending}
                    className="w-full cursor-pointer rounded-[3px] border-0 bg-[#1C1F26] px-3.5 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                >
                    {register.isPending ? 'Creating...' : 'Create account'}
                </button>

                <p className="mt-3 text-center text-[12px] text-[#6B6F76]">
                    Have an account? <Link to="/login" className="text-[#3D5BFF]">Log in</Link>
                </p>
            </form>
        </div>
    )
}
