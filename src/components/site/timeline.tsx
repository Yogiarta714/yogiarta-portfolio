"use client";

import { useEffect, useRef } from "react";

/** Pembungkus timeline: mengisi batang sesuai posisi scroll lewat variabel CSS --p (0 sampai 1). */
export function Timeline({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let frame = 0;

        const update = () => {
            frame = 0;
            const rect = el.getBoundingClientRect();
            if (rect.height <= 0) return;
            const p = Math.max(
                0,
                Math.min(
                    1,
                    (window.innerHeight * 0.62 - rect.top) / rect.height,
                ),
            );
            el.style.setProperty("--p", p.toFixed(3));
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
