"use client";

import { useState } from "react";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

export function ConfirmDelete({
    name,
    prompt = "Hapus?",
    action,
}: {
    name: string;
    prompt?: string;
    action: () => Promise<ActionResult>;
}) {
    const [confirming, setConfirming] = useState(false);
    const { pending, error, run } = useAction();

    if (!confirming) {
        return (
            <div className="space-y-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirming(true)}
                    aria-label={`Hapus ${name}`}
                >
                    Hapus
                </Button>
                {error && (
                    <p
                        role="alert"
                        className="text-destructive max-w-xs text-sm"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            role="group"
            aria-label={`Konfirmasi hapus ${name}`}
            className="flex flex-wrap items-center gap-2"
        >
            <span className="text-sm">{prompt}</span>
            <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() =>
                    run(
                        action,
                        () => setConfirming(false),
                        () => setConfirming(false),
                    )
                }
            >
                {pending ? "Menghapus…" : "Ya, hapus"}
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setConfirming(false)}
            >
                Batal
            </Button>
        </div>
    );
}
