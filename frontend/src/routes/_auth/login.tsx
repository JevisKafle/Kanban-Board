import { useLogin } from '#/features/auth/useAuth'
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
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const login = useLogin()
  const navigate = useNavigate()

  const busy = login.isPending || done
  const stage: Stage = done ? 'done' : login.isPending ? 'doing' : 'todo'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setError(null)
    try {
      await login.mutateAsync({ username, password })
      setDone(true)
      await wait(cardLandDelay())
      navigate({ to: '/boards' })
    } catch (err) {
      const info = parseAuthError(err)
      setError(
        info.kind === 'client'
          ? "That username and password don't match. Check them and try again."
          : info.message,
      )
    }
  }

  return (
    <AuthShell
      stage={stage}
      cardLabel="Log in"
      headline="Plan together, in real time."
      blurb="Cards move on everyone's screen the moment someone drags them."
      footer={
        <>
          New to Kankan?{' '}
          <Link to="/register" className={authLinkClass}>
            Create an account
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit}
        aria-labelledby="login-title"
        aria-busy={busy}
      >
        <AuthHeading
          id="login-title"
          title="Log in to Kankan"
          subtitle="Pick up where your team left off."
        />

        <Field
          label="Username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
        />
        <PasswordField
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <FormError message={error} />

        <SubmitButton busy={busy} idleLabel="Log in" busyLabel="Logging in…" />
      </form>
    </AuthShell>
  )
}