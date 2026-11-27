"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { SiteThemeToggle } from "@/components/site/site-theme-toggle";

const LINKS = [
    { href: "/#about", label: "About" },
    { href: "/#projects", label: "Projects" },
    { href: "/#experience", label: "Experience" },
    { href: "/#certificates", label: "Certificates" },
];

export function SiteNav({ brand }: { brand: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <header className="pointer-events-none fixed inset-x-0 top-3.5 z-50 flex justify-center px-4">
            <nav
                aria-label="Main"
                className="border-s-line bg-s-nav pointer-events-auto relative flex max-w-full items-center gap-1.5 rounded-full border py-1.5 pr-1.5 pl-4 shadow-lg backdrop-blur-md"
            >
                <Link
                    href="/"
                    aria-label={`${brand}, home`}
                    className="font-heading flex items-center gap-2.5 py-2 pr-3 text-base font-bold tracking-tight whitespace-nowrap"
                    onClick={() => setOpen(false)}
                >
                    <Logo className="size-7" />
                    {brand}
                </Link>

                <div className="hidden items-center gap-0.5 md:flex">
                    {LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-s-muted hover:text-s-fg hover:bg-s-surface2 rounded-full px-4 py-2 text-sm transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <Link
                    href="/#contact"
                    className="bg-s-accent text-s-on-accent ml-1 hidden rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 md:inline-flex"
                >
                    Contact
                </Link>

                <SiteThemeToggle />

                <button
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="site-menu"
                    onClick={() => setOpen((o) => !o)}
                    className="border-s-line hover:bg-s-surface2 grid size-10 place-items-center rounded-full border transition-colors md:hidden"
                >
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
                        <path d="M5 9h14M5 15h14" />
                    </svg>
                </button>

                {open && (
                    <div
                        id="site-menu"
                        className="border-s-line bg-s-surface absolute inset-x-0 top-[calc(100%+10px)] rounded-3xl border p-2 shadow-xl md:hidden"
                    >
                        {LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="text-s-muted hover:bg-s-surface2 hover:text-s-fg block rounded-2xl px-4 py-3 text-base"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/#contact"
                            onClick={() => setOpen(false)}
                            className="bg-s-accent text-s-on-accent mt-1.5 block rounded-2xl px-4 py-3 text-center text-base font-semibold"
                        >
                            Contact
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
}
