import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useRegister } from '#/features/auth/useAuth'
import {
    AuthHeading,
    AuthShell,
    Field,
    FormError,
    PasswordField,
    SubmitButton,
    authLinkClass,
    cardLandDelay,
    parseAuthError,
    wait,
    type Stage,
} from '#/features/auth/AuthKit'

export const Route = createFileRoute('/_auth/register')({
    component: RouteComponent,
})

type FieldErrors = Partial<Record<string, string>>

function RouteComponent() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const register = useRegister()
    const navigate = useNavigate()

    const busy = register.isPending || done
    const stage: Stage = done ? 'done' : register.isPending ? 'doing' : 'todo'

    // Typing in a field clears that field's server error.
    function clearFieldError(key: string) {
        setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (busy) return
        setFieldErrors({})
        setFormError(null)
        try {
            await register.mutateAsync({ username, email, password })
            setDone(true)
            await wait(cardLandDelay())
            navigate({ to: '/boards' })
        } catch (err) {
            const info = parseAuthError(err, ['username', 'email', 'password'])
            const hasFieldErrors = Object.keys(info.fields).length > 0
            setFieldErrors(info.fields)
            setFormError(
                info.message ??
                (hasFieldErrors
                    ? null
                    : 'Could not create your account. Check your details and try again.'),
            )
        }
    }

    return (
        <AuthShell
            stage={stage}
            cardLabel="Sign up"
            headline="Start a board in a minute."
            blurb="Add teammates by username and work on the same cards together."
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className={authLinkClass}>
                        Log in
                    </Link>
                </>
            }
        >
            <form
                onSubmit={handleSubmit}
                aria-labelledby="register-title"
                aria-busy={busy}
            >
                <AuthHeading
                    id="register-title"
                    title="Create your account"
                    subtitle="Make a board, then add people to it by username."
                />

                <Field
                    label="Username"
                    name="username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value)
                        clearFieldError('username')
                    }}
                    error={fieldErrors.username}
                    hint="Other people will use this to add you to their boards."
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                />
                <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        clearFieldError('email')
                    }}
                    error={fieldErrors.email}
                    autoComplete="email"
                    required
                />
                <PasswordField
                    label="Password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        clearFieldError('password')
                    }}
                    error={fieldErrors.password}
                    hint="At least 8 characters."
                    autoComplete="new-password"
                    required
                />

                <FormError message={formError} />

                <SubmitButton
                    busy={busy}
                    idleLabel="Create account"
                    busyLabel="Creating account…"
                />
            </form>
        </AuthShell>
    )
}