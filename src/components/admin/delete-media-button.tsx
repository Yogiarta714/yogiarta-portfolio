"use client";

import { useState, useTransition } from "react";
import { deleteMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";

export function DeleteMediaButton({ id, name }: { id: string; name: string }) {
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    function remove() {
        setError(null);
        startTransition(async () => {
            const result = await deleteMediaAction(id);
            if (!result.ok) {
                setError(result.error.message);
                setConfirming(false);
            }
        });
    }

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
                    <p role="alert" className="text-destructive text-sm">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={`Konfirmasi hapus ${name}`}
        >
            <span className="text-sm">Hapus file ini?</span>
            <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={remove}
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
