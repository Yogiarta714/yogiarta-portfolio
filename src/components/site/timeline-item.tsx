"use client";

import { useEffect, useRef, useState } from "react";

/** Satu titik timeline. Menyala saat item melewati 62% tinggi layar, padam lagi saat di-scroll naik. */
export function TimelineItem({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                setOn(entry.isIntersecting || entry.boundingClientRect.top < 0);
            },
            { rootMargin: "0px 0px -38% 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} data-on={on} className="relative pb-11 last:pb-0">
            <span className="tl-dot" aria-hidden="true" />
            {children}
        </div>
    );
}
