"use client";

import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

type Direction = "up" | "down";

export function MoveButtons({
    name,
    canUp,
    canDown,
    disabled = false,
    onMove,
}: {
    name: string;
    canUp: boolean;
    canDown: boolean;
    disabled?: boolean;
    onMove: (direction: Direction) => Promise<ActionResult>;
}) {
    const { pending, error, run } = useAction();
    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canUp || pending || disabled}
                aria-label={`Naikkan ${name}`}
                onClick={() => run(() => onMove("up"))}
            >
                ↑
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canDown || pending || disabled}
                aria-label={`Turunkan ${name}`}
                onClick={() => run(() => onMove("down"))}
            >
                ↓
            </Button>
            {error && (
                <span role="alert" className="text-destructive text-sm">
                    {error}
                </span>
            )}
        </div>
    );
}
