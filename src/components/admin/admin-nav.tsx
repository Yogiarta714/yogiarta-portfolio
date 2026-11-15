"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavItems } from "./nav-items";

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Navigasi admin">
            <ul className="space-y-1">
                {adminNavItems.map((item) => {
                    if (!item.ready) {
                        return (
                            <li key={item.href}>
                                <span
                                    aria-disabled="true"
                                    className="text-muted-foreground/60 flex items-center justify-between rounded-md px-3 py-2 text-sm"
                                >
                                    {item.label}
                                    <span className="font-mono text-[10px] tracking-wide uppercase">
                                        segera
                                    </span>
                                </span>
                            </li>
                        );
                    }

                    const active =
                        item.href === "/admin"
                            ? pathname === "/admin"
                            : pathname.startsWith(item.href);

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "block rounded-md px-3 py-2 text-sm transition-colors",
                                    active
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                )}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
