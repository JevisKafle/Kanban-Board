import { useId, useState, type ComponentProps, type ReactNode } from 'react'

export type Stage = 'todo' | 'doing' | 'done'

const COLUMNS = ['To do', 'In progress', 'Done'] as const

const CARD_STAGE: Record<Stage, string> = {
    todo: 'translate-x-0 translate-y-0 scale-100 rotate-0 shadow-[0_2px_0_rgba(24,36,112,0.18)]',
    doing:
        'translate-x-[calc(100%_+_32px)] -translate-y-1.5 scale-[1.06] rotate-[3deg] shadow-[0_18px_28px_-10px_rgba(24,36,112,0.6)]',
    done: 'translate-x-[calc(200%_+_64px)] translate-y-0 scale-100 rotate-0 shadow-[0_2px_0_rgba(24,36,112,0.18)]',
}

function Check() {
    return (
        <svg
            viewBox="0 0 10 10"
            className="size-2.5 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:scale-50 starting:opacity-0"
        >
            <path
                d="M2 5.2 4.2 7.3 8 3"
                fill="none"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function RestingCard({ muted }: { muted?: boolean }) {
    return (
        <div
            className={[
                'flex h-14 flex-col justify-between rounded-[5px] bg-white p-2.5',
                muted ? 'opacity-70' : '',
            ].join(' ')}
        >
            <div className="space-y-1.5">
                <span className="block h-1.5 w-4/5 rounded-full bg-brand-100" />
                <span className="block h-1.5 w-1/2 rounded-full bg-brand-50" />
            </div>
            <span className="size-3.5 self-end rounded-full bg-brand-200" />
        </div>
    )
}

function Cursor({
    name,
    tone,
    className,
}: {
    name: string
    tone: string
    className: string
}) {
    return (
        <div className={`pointer-events-none absolute flex items-start ${className}`}>
            <svg width="16" height="18" viewBox="0 0 16 18" className="drop-shadow-sm">
                <path
                    d="M1 1 14 8.2 8 9.8 5.6 16.4 1 1Z"
                    fill="white"
                    stroke="#14172b"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
            </svg>
            <span
                className={`mt-4 -ml-0.5 rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium text-ink ${tone}`}
            >
                {name}
            </span>
        </div>
    )
}

function BoardPeek({ stage, cardLabel }: { stage: Stage; cardLabel: string }) {

    const targetColumn = stage === 'doing' ? 1 : stage === 'done' ? 2 : -1

    return (
        <div aria-hidden="true" className="relative w-full max-w-135 select-none">
            <div className="grid grid-cols-3 gap-3">
                {COLUMNS.map((name, i) => (
                    <div
                        key={name}
                        className={[
                            'h-43 rounded-lg p-2.5 transition-colors duration-200 ease-out',
                            i === targetColumn ? 'bg-white/25' : 'bg-white/12',
                        ].join(' ')}
                    >
                        <p className="mb-2 h-6 text-[12px] leading-6 font-medium text-white/85">
                            {name}
                        </p>
                        <RestingCard muted={i === 2} />
                    </div>
                ))}
            </div>

            {/* the card that moves: second slot, starts in To do */}
            <div
                className={[
                    'absolute top-26.5 left-2.5 flex h-14 w-[calc((100%-24px)/3-20px)] items-center gap-2 rounded-[5px] bg-white px-2.5 text-ink',
                    'transition-[translate,scale,rotate,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]',
                    'motion-reduce:transition-none',
                    CARD_STAGE[stage],
                ].join(' ')}
            >
                <span
                    className={[
                        'grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-200',
                        stage === 'todo' && 'border-brand-200',
                        stage === 'doing' && 'border-brand-600 bg-brand-100',
                        stage === 'done' && 'border-brand-600 bg-brand-600',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                >
                    {stage === 'done' && <Check />}
                </span>
                <span className="truncate text-[12px] leading-none font-semibold">
                    {cardLabel}
                </span>
            </div>

            <Cursor name="Asha" tone="bg-sun" className="top-21 left-[16%]" />
            <Cursor name="James" tone="bg-mint" className="top-8.5 right-[8%]" />
        </div>
    )
}

export function Mark() {
    return (
        <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden="true">
            <rect x="0" y="0" width="10" height="28" rx="2.5" className="fill-brand-100" />
            <rect x="12.5" y="0" width="10" height="28" rx="2.5" className="fill-brand-100" />
            <rect x="25" y="0" width="10" height="28" rx="2.5" className="fill-brand-100" />
            <rect x="2" y="3" width="6" height="5" rx="1.2" className="fill-brand-600" />
            <rect x="2" y="10" width="6" height="5" rx="1.2" className="fill-brand-600" />
            <rect x="14.5" y="3" width="6" height="5" rx="1.2" className="fill-brand-600" />
            <g transform="rotate(-9 23 13)">
                <rect x="19.5" y="10" width="7" height="5.5" rx="1.3" className="fill-brand-400" />
            </g>
        </svg>
    )
}


export function AuthShell({
    stage,
    cardLabel,
    headline,
    blurb,
    footer,
    children,
}: {
    stage: Stage
    cardLabel: string
    headline: string
    blurb: string
    footer: ReactNode
    children: ReactNode
}) {
    return (
        // Covers the whole viewport, whatever the _auth layout draws around it.
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
            <div className="grid min-h-full lg:grid-cols-[1.1fr_1fr]">
                {/* Brand panel */}
                <aside className="relative hidden overflow-hidden bg-brand-600 p-12 text-white lg:flex lg:flex-col">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-44 -right-44 size-120 rounded-full border border-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-28 -right-28 size-88 rounded-full border border-white/10"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-56 -left-40 size-136 rounded-full border border-white/10"
                    />

                    <div className="relative flex flex-1 items-center justify-center">
                        <BoardPeek stage={stage} cardLabel={cardLabel} />
                    </div>

                    <div className="relative max-w-[38ch]">
                        <h2 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">
                            {headline}
                        </h2>
                        <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                            {blurb}
                        </p>
                    </div>
                </aside>

                {/* Form panel */}
                <main className="flex min-h-dvh flex-col px-6 py-10 sm:px-14">
                    <div className="mx-auto my-auto w-full max-w-95">
                        <div className="mb-6">
                            <Mark />
                        </div>
                        {children}
                    </div>

                    <p className="pt-8 text-center text-[13px] text-muted">{footer}</p>
                </main>
            </div>
        </div>
    )
}

export const authLinkClass =
    'font-semibold text-brand-600 underline-offset-2 hover:underline focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600'


export function AuthHeading({
    id,
    title,
    subtitle,
}: {
    id: string
    title: string
    subtitle: string
}) {
    return (
        <header className="mb-8">
            <h1
                id={id}
                className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink"
            >
                {title}
            </h1>
            <p className="mt-2 text-[14px] text-muted">{subtitle}</p>
        </header>
    )
}

type FieldProps = Omit<ComponentProps<'input'>, 'className' | 'children'> & {
    label: string
    error?: string | null
    hint?: string
    trailing?: ReactNode
}

export function Field({
    label,
    error,
    hint,
    trailing,
    id,
    ...input
}: FieldProps) {
    const autoId = useId()
    const fieldId = id ?? autoId
    const noteId = `${fieldId}-note`

    return (
        <div className="mb-4">
            <label
                htmlFor={fieldId}
                className="mb-1.5 block text-[13px] font-medium text-ink"
            >
                {label}
            </label>
            <div className="relative">
                <input
                    {...input}
                    id={fieldId}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error || hint ? noteId : undefined}
                    className={[
                        // text-base on mobile stops iOS zooming in on focus
                        'block w-full rounded-lg border bg-white py-3 pl-3.5 text-base text-ink sm:text-[14px]',
                        'outline-none transition-[border-color,box-shadow] duration-150 ease-out focus-visible:ring-4',
                        trailing ? 'pr-16' : 'pr-3.5',
                        error
                            ? 'border-danger focus-visible:ring-danger/15'
                            : 'border-field hover:border-muted focus-visible:border-brand-600 focus-visible:ring-brand-600/15',
                    ].join(' ')}
                />
                {trailing && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {trailing}
                    </div>
                )}
            </div>
            {error ? (
                <p
                    id={noteId}
                    role="alert"
                    className="mt-1.5 text-[12px] text-danger transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:-translate-y-0.5 starting:opacity-0"
                >
                    {error}
                </p>
            ) : hint ? (
                <p id={noteId} className="mt-1.5 text-[12px] text-muted">
                    {hint}
                </p>
            ) : null}
        </div>
    )
}

export function PasswordField(props: Omit<FieldProps, 'type' | 'trailing'>) {
    const [visible, setVisible] = useState(false)

    return (
        <Field
            {...props}
            type={visible ? 'text' : 'password'}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    className="cursor-pointer rounded-[5px] px-2 py-1 text-[12px] font-medium text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-600"
                >
                    {visible ? 'Hide' : 'Show'}
                </button>
            }
        />
    )
}

export function FormError({ message }: { message: string | null }) {
    if (!message) return null
    return (
        <div
            role="alert"
            className="mb-4 rounded-lg border border-danger/30 bg-danger/6 px-3.5 py-3 text-[13px] leading-snug text-[#8e2a1f] transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:-translate-y-1 starting:opacity-0"
        >
            {message}
        </div>
    )
}

export function SubmitButton({
    busy,
    idleLabel,
    busyLabel,
}: {
    busy: boolean
    idleLabel: string
    busyLabel: string
}) {
    return (
        <button
            type="submit"
            disabled={busy}
            className="mt-1 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-[14px] font-semibold text-white transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-brand-700 enabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
            {busy && (
                <span
                    aria-hidden="true"
                    className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white [animation-duration:700ms] motion-reduce:animate-none"
                />
            )}
            {busy ? busyLabel : idleLabel}
        </button>
    )
}

export const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))

export function cardLandDelay() {
    const boardVisible = window.matchMedia('(min-width: 1024px)').matches
    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches
    return boardVisible && !reduceMotion ? 320 : 0
}

export type AuthError = {
    kind: 'network' | 'server' | 'client'
    fields: Record<string, string>
    message: string | null
}

function firstMessage(value: unknown): string | undefined {
    if (Array.isArray(value)) {
        return typeof value[0] === 'string' ? value[0] : undefined
    }
    return typeof value === 'string' ? value : undefined
}

export function parseAuthError(
    err: unknown,
    knownFields: string[] = [],
): AuthError {
    const e = err as { status?: unknown; body?: unknown } | null
    const status = typeof e?.status === 'number' ? e.status : null

    if (status === null) {
        return {
            kind: 'network',
            fields: {},
            message: "Can't reach the server. Check your connection and try again.",
        }
    }
    if (status >= 500) {
        return {
            kind: 'server',
            fields: {},
            message: 'Something went wrong on our side. Try again in a moment.',
        }
    }

    const body =
        e?.body && typeof e.body === 'object'
            ? (e.body as Record<string, unknown>)
            : {}
    const fields: Record<string, string> = {}
    const extra: string[] = []

    for (const [key, value] of Object.entries(body)) {
        const msg = firstMessage(value)
        if (!msg) continue
        if (knownFields.includes(key)) fields[key] = msg
        else extra.push(msg) // non_field_errors, detail, unexpected keys
    }

    return { kind: 'client', fields, message: extra[0] ?? null }
}