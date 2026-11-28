"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Konten muncul pelan saat di-scroll. Tanpa JavaScript atau dengan reduce motion,
 * konten tetap terlihat. Elemen yang sudah terlihat saat dimuat tidak dianimasikan.
 */
export function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

        el.classList.add("reveal-hidden");
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("reveal-in");
                    io.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn("reveal", className)}
            style={
                delay
                    ? ({ "--delay": `${delay}s` } as React.CSSProperties)
                    : undefined
            }
        >
            {children}
        </div>
    );
}
