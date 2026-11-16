"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

// Mengikuti kelas "dark" di <html>, yang diatur skrip tema di layout
function subscribe(callback: () => void) {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
    });
    return () => observer.disconnect();
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function ThemeToggle({ className }: { className?: string }) {
    const isDark = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    function toggle() {
        const next = !isDark;
        document.documentElement.classList.toggle("dark", next);
        try {
            localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
            // Penyimpanan diblokir: tema tetap berganti, hanya tidak diingat.
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggle}
            className={className}
            aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
        >
            {isDark ? (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
            ) : (
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
            )}
        </Button>
    );
}
