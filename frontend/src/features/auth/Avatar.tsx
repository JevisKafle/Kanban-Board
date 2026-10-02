const SIZES = {
    sm: 'size-7 text-[11px]',
    md: 'size-9 text-[13px]',
    lg: 'size-20 text-[28px]',
} as const

export type AvatarSize = keyof typeof SIZES

const firstChar = (s: string) => Array.from(s)[0] ?? ''

export function getInitials(name: string | null | undefined): string {
    const clean = (name ?? '').trim()
    if (!clean) return '?'

    const parts = clean
        .replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2') // camelCase boundary
        .split(/[\s._-]+/)
        .filter(Boolean)

    const [first, second] = parts
    if (!first) return '?'
    if (second) return (firstChar(first) + firstChar(second)).toUpperCase()
    return Array.from(first).slice(0, 2).join('').toUpperCase()
}

export function Avatar({
    name,
    size = 'md',
    className = '',
}: {
    name: string | null | undefined
    size?: AvatarSize
    className?: string
}) {
    return (
        <span
            aria-hidden="true"
            className={[
                'grid shrink-0 place-items-center rounded-full bg-brand-100 font-semibold tracking-tight text-brand-700 select-none',
                SIZES[size],
                className,
            ].join(' ')}
        >
            {getInitials(name)}
        </span>
    )
}