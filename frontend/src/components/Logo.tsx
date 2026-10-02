export function Logo({
    tone = 'brand',
    wordmark = false,
    className = '',
}: {
    tone?: 'brand' | 'light'
    wordmark?: boolean
    className?: string
}) {
    const light = tone === 'light'
    const col = light ? 'fill-white/25' : 'fill-brand-100'
    const card = light ? 'fill-white' : 'fill-brand-600'
    const moving = light ? 'fill-brand-200' : 'fill-brand-400'

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <svg width="30" height="23" viewBox="0 0 36 28" aria-hidden="true">
                <rect x="0" y="0" width="10" height="28" rx="2.5" className={col} />
                <rect x="12.5" y="0" width="10" height="28" rx="2.5" className={col} />
                <rect x="25" y="0" width="10" height="28" rx="2.5" className={col} />
                <rect x="2" y="3" width="6" height="5" rx="1.2" className={card} />
                <rect x="2" y="10" width="6" height="5" rx="1.2" className={card} />
                <rect x="14.5" y="3" width="6" height="5" rx="1.2" className={card} />
                <g transform="rotate(-9 23 13)">
                    <rect x="19.5" y="10" width="7" height="5.5" rx="1.3" className={moving} />
                </g>
            </svg>
            {wordmark && (
                <span
                    className={`text-[17px] font-semibold tracking-[-0.02em] ${light ? 'text-white' : 'text-ink'}`}
                >
                    Kankan
                </span>
            )}
        </span>
    )
}