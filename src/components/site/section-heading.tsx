export function Eyebrow({
    index,
    label,
    plain = false,
}: {
    index: string;
    label: string;
    plain?: boolean;
}) {
    return (
        <div
            className={`${plain ? "" : "s-eyebrow"} text-s-muted flex items-center gap-3.5 font-mono text-[13px] tracking-[0.08em] uppercase`}
        >
            <b className="text-s-accent font-medium">{index}</b>
            {label}
        </div>
    );
}

export function SectionTitle({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`font-heading mt-4 max-w-205 text-[clamp(28px,4vw,46px)] leading-[1.08] font-bold tracking-[-0.03em] text-balance ${className}`}
        >
            {children}
        </h2>
    );
}
