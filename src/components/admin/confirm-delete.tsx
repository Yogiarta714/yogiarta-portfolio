"use client";

import { useId, useRef } from "react";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

export function ConfirmDelete({
    name,
    description,
    action,
}: {
    name: string;
    description?: string;
    action: () => Promise<ActionResult>;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descId = useId();
    const { pending, error, run, reset } = useAction();

    function open() {
        reset();
        dialogRef.current?.showModal();
    }

    function close() {
        dialogRef.current?.close();
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Hapus ${name}`}
                onClick={open}
                className="hover:bg-destructive dark:hover:bg-destructive dark:hover:text-background hover:text-white"
            >
                Hapus
            </Button>

            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                aria-describedby={descId}
                // Selama proses berjalan, jendela tidak boleh tertutup oleh Esc atau klik latar.
                onCancel={(e) => {
                    if (pending) e.preventDefault();
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget && !pending) close();
                }}
                className="bg-card text-card-foreground border-border/60 m-auto w-[min(92vw,26rem)] rounded-2xl border p-0 shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                <div className="space-y-4 p-6">
                    <div className="space-y-1.5">
                        <h2
                            id={titleId}
                            className="font-sans text-lg font-semibold"
                        >
                            Hapus “{name}”?
                        </h2>
                        <p
                            id={descId}
                            className="text-muted-foreground text-sm"
                        >
                            {description ??
                                "Tindakan ini tidak bisa dibatalkan."}
                        </p>
                    </div>

                    {error && (
                        <p role="alert" className="text-destructive text-sm">
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={pending}
                            onClick={close}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={pending}
                            onClick={() => run(action, close)}
                        >
                            {pending ? "Menghapus…" : "Ya, hapus"}
                        </Button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
