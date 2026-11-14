"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function MobileNav({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Menyimpan halaman tempat menu dibuka
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const open = openedAt === pathname;

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpenedAt(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <>
            <header className="bg-background sticky top-0 z-40 flex h-14 items-center justify-between border-b px-4 md:hidden">
                <span className="font-heading text-lg font-semibold">
                    yogiarta
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    onClick={() => setOpenedAt(open ? null : pathname)}
                >
                    {open ? "Tutup" : "Menu"}
                </Button>
            </header>

            {open && (
                <div
                    id="mobile-nav"
                    className="bg-sidebar text-sidebar-foreground fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto p-4 md:hidden"
                >
                    {children}
                </div>
            )}
        </>
    );
}
