/** Logo: setengah atas oranye, bawah netral, garis zigzag cyan */
export function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 72 72"
            className={className}
            aria-hidden="true"
            focusable="false"
        >
            <path
                style={{ fill: "var(--s-accent)" }}
                d="M7.09 28L21.5 48L36 28L50.5 48L64.91 28A30 30 0 0 0 7.09 28Z"
            />
            <path
                style={{ fill: "var(--s-fg)" }}
                d="M7.09 28L21.5 48L36 28L50.5 48L64.91 28A30 30 0 1 1 7.09 28Z"
            />
            <path
                style={{
                    fill: "none",
                    stroke: "var(--s-pop)",
                    strokeWidth: 3,
                    strokeLinejoin: "round",
                    strokeLinecap: "round",
                }}
                d="M7.09 28L21.5 48L36 28L50.5 48L64.91 28"
            />
        </svg>
    );
}
