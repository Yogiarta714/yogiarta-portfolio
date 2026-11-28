"use client";

import { useEffect, useRef, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
    const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
    const linkRef = useRef<HTMLAnchorElement>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy() {
        try {
            await navigator.clipboard.writeText(email);
            setState("copied");
        } catch {
            // Clipboard diblokir: pilih teksnya agar bisa disalin dengan Ctrl+C.
            const el = linkRef.current;
            if (el) {
                const range = document.createRange();
                range.selectNodeContents(el);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
            }
            setState("manual");
        }
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 1800);
    }

    return (
        <div className="border-s-line bg-s-surface hover:border-s-pop inline-flex max-w-full items-center gap-3.5 rounded-full border py-3 pr-3 pl-6 font-mono text-[15px] transition-colors">
            <a
                ref={linkRef}
                href={`mailto:${email}`}
                className="min-w-0 break-all"
            >
                {email}
            </a>
            <button
                type="button"
                onClick={copy}
                className="bg-s-accent text-s-on-accent shrink-0 rounded-full px-4.5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
            >
                {state === "copied"
                    ? "Copied ✓"
                    : state === "manual"
                      ? "Press Ctrl+C"
                      : "Copy"}
            </button>
        </div>
    );
}
