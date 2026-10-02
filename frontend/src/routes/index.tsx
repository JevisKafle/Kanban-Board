import { createFileRoute, Link } from '@tanstack/react-router'
import { useMe } from '#/features/auth/useAuth'
import { Avatar } from '#/features/auth/Avatar'
import { Logo } from '#/components/Logo'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const primaryBtn =
  'inline-flex items-center justify-center rounded-[8px] bg-brand-600 px-5 py-3 text-[14px] font-semibold text-white transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-700 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'
const secondaryBtn =
  'inline-flex items-center justify-center rounded-[8px] border border-field/60 bg-white px-5 py-3 text-[14px] font-semibold text-ink transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-surface active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'


const BOARD = [
  {
    name: 'To do',
    cards: [
      { title: 'Write release notes', who: 'Ravi Shah', tag: 'Docs' },
      { title: 'Fix login redirect', who: 'Asha Rai', tag: 'Bug' },
    ],
  },
  {
    name: 'In progress',
    cards: [{ title: 'Design board header', who: 'Asha Rai', tag: 'Design' }],
  },
  {
    name: 'Done',
    cards: [
      { title: 'Set up Redis', who: 'Ravi Shah', tag: 'Infra' },
      { title: 'Drag and drop', who: 'Asha Rai', tag: 'Feature' },
    ],
  },
]

function HeroBoard() {
  return (
    <div
      aria-hidden="true"
      className="relative select-none rounded-[20px] bg-brand-600 p-4 shadow-[0_30px_60px_-30px_rgba(37,56,196,0.6)] sm:p-5"
    >
      <div className="grid grid-cols-3 gap-3">
        {BOARD.map((col) => (
          <div key={col.name} className="rounded-[10px] bg-white/12 p-2.5">
            <p className="mb-2 flex items-center justify-between px-0.5 text-[12px] font-medium text-white/85">
              {col.name}
              <span className="text-white/60">{col.cards.length}</span>
            </p>
            <div className="space-y-2">
              {col.cards.map((c) => (
                <div
                  key={c.title}
                  className="rounded-md bg-white p-2.5 shadow-[0_2px_0_rgba(24,36,112,0.15)]"
                >
                  <p className="text-[12px] leading-snug font-medium text-ink">
                    {c.title}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                      {c.tag}
                    </span>
                    <Avatar name={c.who} size="sm" className="size-5 text-[9px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* a card being carried between columns */}
      <div className="absolute top-33 left-[31%] w-[28%] rotate-[4deg] rounded-md bg-white p-2.5 shadow-[0_22px_32px_-12px_rgba(24,36,112,0.65)] ring-2 ring-brand-200">
        <p className="text-[12px] leading-snug font-medium text-ink">
          Review pull request
        </p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
            Review
          </span>
          <Avatar name="Ravi Shah" size="sm" className="size-5 text-[9px]" />
        </div>
      </div>
      <div className="pointer-events-none absolute top-49 left-[48%] flex items-start">
        <svg width="16" height="18" viewBox="0 0 16 18" className="drop-shadow-sm">
          <path d="M1 1 14 8.2 8 9.8 5.6 16.4 1 1Z" fill="white" stroke="#14172b" strokeLinejoin="round" />
        </svg>
        <span className="mt-4 -ml-0.5 rounded-full bg-sun px-2 py-0.5 text-[11px] leading-4 font-medium text-ink">
          Ravi
        </span>
      </div>
    </div>
  )
}

/* ---------------- Page ---------------- */

const FEATURES = [
  {
    title: 'Live for everyone',
    body: 'Drag a card and it moves on every teammate\u2019s screen right away. No refreshing, no stale boards.',
    visual: (
      <div className="flex gap-2">
        <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-medium text-ink">Asha</span>
        <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-medium text-ink">Ravi</span>
      </div>
    ),
  },
  {
    title: 'Roles that make sense',
    body: 'Owners manage the board, editors move the cards, and viewers can follow along without changing anything.',
    visual: (
      <div className="flex gap-2">
        {['Owner', 'Editor', 'Viewer'].map((r) => (
          <span key={r} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
            {r}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: 'Add people by username',
    body: 'Pick a username, choose a role, and they are on the board. No invite links to chase.',
    visual: (
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-muted">
        <Avatar name="Ritu Gurung" size="sm" className="size-5 text-[9px]" />
        ritu.gurung
      </div>
    ),
  },
]

function HomePage() {
  const { data: user, isLoading } = useMe()

  return (
    <div className="min-h-dvh bg-surface text-ink">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" aria-label="Kankan home">
          <Logo wordmark />
        </Link>

        <nav className="flex min-h-10 items-center gap-2">
          {isLoading ? null : user ? (
            <>
              <Link to="/account" aria-label="Account" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                <Avatar name={user.username} size="md" />
              </Link>
              <Link to="/boards" className={`${primaryBtn} py-2!`}>
                Go to boards
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-[14px] font-semibold text-ink hover:text-brand-600">
                Log in
              </Link>
              <Link to="/register" className={`${primaryBtn} py-2!`}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-8 pb-20 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:pt-14 lg:pb-28">
          <div>
            <h1 className="text-[44px] leading-[1.02] font-semibold tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
              Move work forward, <span className="text-brand-600">together.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-muted">
              Kankan is a kanban board where every card moves on everyone&rsquo;s screen the moment someone drags it. Create a board, add your team, and get to work.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isLoading ? (
                <div className="h-12" />
              ) : user ? (
                <>
                  <Link to="/boards" className={primaryBtn}>Go to boards</Link>
                  <Link to="/account" className={secondaryBtn}>Account</Link>
                  <p className="w-full text-[13px] text-muted">Signed in as {user.username}</p>
                </>
              ) : (
                <>
                  <Link to="/register" className={primaryBtn}>Get started</Link>
                  <Link to="/login" className={secondaryBtn}>Log in</Link>
                </>
              )}
            </div>
          </div>

          <HeroBoard />
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <h2 className="max-w-[22ch] text-[32px] leading-tight font-semibold tracking-tight sm:text-[40px]">
            Everything a small team needs on one board.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="flex flex-col rounded-[14px] border border-line bg-white p-6">
                <div className="mb-6 min-h-8">{f.visual}</div>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
          <div className="relative overflow-hidden rounded-[20px] bg-brand-600 px-6 py-14 text-center text-white sm:px-12">
            <div aria-hidden="true" className="absolute -top-40 -right-32 size-104 rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute -bottom-48 -left-24 size-112 rounded-full border border-white/10" />
            <h2 className="relative mx-auto max-w-[20ch] text-[32px] leading-tight font-semibold tracking-tight sm:text-[40px]">
              Start your first board today.
            </h2>
            <p className="relative mx-auto mt-3 max-w-[44ch] text-[15px] text-white/80">
              It takes a minute to sign up, and your team can join as soon as you add them.
            </p>
            <Link
              to={user ? '/boards' : '/register'}
              className="relative mt-8 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-[14px] font-semibold text-brand-700 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-50 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {user ? 'Go to boards' : 'Get started'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Logo wordmark />
          <p className="text-[13px] text-muted">A real-time kanban board built with Django Channels and React.</p>
        </div>
      </footer>
    </div>
  )
}