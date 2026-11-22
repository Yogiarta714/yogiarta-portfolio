"use client";

import type { ReactNode } from "react";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

export function RowAction({
    label,
    ariaLabel,
    action,
    variant = "ghost",
    pressed,
}: {
    label: string;
    ariaLabel: string;
    action: () => Promise<ActionResult>;
    variant?: "ghost" | "secondary";
    pressed?: boolean;
}) {
    const { pending, error, run } = useAction();
    return (
        <div className="space-y-1">
            <Button
                type="button"
                variant={variant}
                size="sm"
                disabled={pending}
                aria-pressed={pressed}
                aria-label={ariaLabel}
                onClick={() => run(action)}
            >
                {label}
            </Button>
            {error && (
                <p role="alert" className="text-destructive max-w-56 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

export function Badge({
    children,
    tone,
}: {
    children: ReactNode;
    tone: "primary" | "muted" | "danger";
}) {
    return (
        <span
            className={cn(
                "rounded-full border px-2 py-0.5 text-xs",
                tone === "primary" && "border-primary/40 text-primary",
                tone === "muted" && "border-border text-muted-foreground",
                tone === "danger" && "border-destructive/50 text-destructive",
            )}
        >
            {children}
        </span>
    );
}
