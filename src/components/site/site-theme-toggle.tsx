"use client";

export function SiteThemeToggle() {
    function toggle() {
        const root = document.documentElement;
        const dark = !root.classList.contains("dark");
        root.classList.toggle("dark", dark);
        try {
            localStorage.setItem("theme", dark ? "dark" : "light");
        } catch {
            // penyimpanan diblokir: tema tetap berubah, hanya tidak diingat
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle light or dark theme"
            className="border-s-line hover:bg-s-surface2 hover:text-s-accent grid size-10 place-items-center rounded-full border transition-colors active:scale-95"
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="8" />
                <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
            </svg>
        </button>
    );
}
