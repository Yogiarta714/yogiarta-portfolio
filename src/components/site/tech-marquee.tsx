/** Mengulang daftar sampai cukup panjang agar putarannya tidak terlihat putus. */
function fill(names: string[], min: number) {
    const out: string[] = [];
    while (out.length < min) out.push(...names);
    return out;
}

function Row({ names, reverse }: { names: string[]; reverse?: boolean }) {
    const items = fill(names, 10);
    return (
        <div
            className={`s-track ${reverse ? "rev" : ""}`}
            aria-hidden={reverse ? "true" : undefined}
        >
            {items.map((name, i) => (
                <span key={`a-${name}-${i}`} className="s-tag">
                    {name}
                </span>
            ))}
            {items.map((name, i) => (
                <span
                    key={`b-${name}-${i}`}
                    className="s-tag"
                    aria-hidden="true"
                >
                    {name}
                </span>
            ))}
        </div>
    );
}

export function TechMarquee({ names }: { names: string[] }) {
    if (names.length === 0) return null;
    const split = names.length >= 8;
    const first = split ? names.filter((_, i) => i % 2 === 0) : names;
    const second = split ? names.filter((_, i) => i % 2 === 1) : [];

    return (
        <div className="s-marquee" aria-label="Technologies I use">
            <Row names={first} />
            {second.length > 0 && <Row names={second} reverse />}
        </div>
    );
}
