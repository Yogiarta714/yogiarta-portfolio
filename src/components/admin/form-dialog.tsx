"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function FormDialog({
    title,
    description,
    trigger,
    children,
}: {
    title: string;
    description?: string;
    trigger: (open: () => void) => ReactNode;
    children: (close: () => void) => ReactNode;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <>
            {trigger(() => setOpen(true))}
            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={() => setOpen(false)}
                className="bg-card text-card-foreground border-border/60 m-auto max-h-[90dvh] w-[min(94vw,42rem)] overflow-y-auto rounded-2xl border p-0 shadow-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
            >
                {open && (
                    <div className="space-y-5 p-6">
                        <div className="space-y-1">
                            <h2
                                id={titleId}
                                className="font-sans text-lg font-semibold"
                            >
                                {title}
                            </h2>
                            {description && (
                                <p className="text-muted-foreground text-sm">
                                    {description}
                                </p>
                            )}
                        </div>
                        {children(() => setOpen(false))}
                    </div>
                )}
            </dialog>
        </>
    );
}
