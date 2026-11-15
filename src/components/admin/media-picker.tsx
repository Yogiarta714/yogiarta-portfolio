"use client";

import { useMemo, useState } from "react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import type { MediaItem, MediaKind } from "@/lib/media-rules";
import { cn } from "@/lib/utils";

type Props = {
    name: string;
    label: string;
    kind: MediaKind;
    valueId: string;
    items: MediaItem[];
    onChange: (id: string | null) => void;
    hint?: string;
    error?: string;
};

function Thumb({ item, className }: { item: MediaItem; className?: string }) {
    return item.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={item.url}
            alt=""
            loading="lazy"
            className={cn("bg-secondary object-cover", className)}
        />
    ) : (
        <div
            className={cn(
                "bg-secondary text-muted-foreground grid place-items-center font-mono text-xs",
                className,
            )}
        >
            PDF
        </div>
    );
}

export function MediaPicker({
    name,
    label,
    kind,
    valueId,
    items,
    onChange,
    hint,
    error,
}: Props) {
    const [open, setOpen] = useState(false);
    const [extra, setExtra] = useState<MediaItem[]>([]);

    // File yang baru diunggah langsung muncul tanpa menunggu halaman dimuat ulang
    const all = useMemo(
        () => [
            ...extra,
            ...items.filter((i) => !extra.some((e) => e.id === i.id)),
        ],
        [extra, items],
    );
    const selected = all.find((i) => i.id === valueId) ?? null;
    const errorId = `${name}-error`;

    return (
        <div className="space-y-2" role="group" aria-label={label}>
            <p className="text-sm font-medium">{label}</p>
            <input type="hidden" name={name} value={valueId} />

            <div className="flex flex-wrap items-center gap-4">
                {selected ? (
                    <div className="flex min-w-0 items-center gap-3">
                        <Thumb
                            item={selected}
                            className="size-16 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                            <p
                                className="truncate font-medium"
                                title={selected.originalName}
                            >
                                {selected.originalName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {formatBytes(selected.sizeBytes)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Belum dipilih
                    </p>
                )}

                <div className="flex gap-2">
                    <Button
                        id={name}
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-expanded={open}
                        aria-describedby={error ? errorId : undefined}
                        onClick={() => setOpen((o) => !o)}
                    >
                        {selected ? "Ganti" : "Pilih"}
                    </Button>
                    {selected && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(null)}
                        >
                            Lepas
                        </Button>
                    )}
                </div>
            </div>

            {open && (
                <div className="bg-secondary/50 space-y-5 rounded-xl p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Pilih dari file yang ada
                        </p>
                        {all.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Belum ada file.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {all.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            aria-pressed={item.id === valueId}
                                            onClick={() => {
                                                onChange(item.id);
                                                setOpen(false);
                                            }}
                                            className={cn(
                                                "hover:bg-secondary focus-visible:ring-ring w-full space-y-1 rounded-lg border p-2 text-left focus-visible:ring-2 focus-visible:outline-none",
                                                item.id === valueId &&
                                                    "border-primary",
                                            )}
                                        >
                                            <Thumb
                                                item={item}
                                                className="aspect-video w-full rounded-md"
                                            />
                                            <span
                                                className="block truncate text-sm"
                                                title={item.originalName}
                                            >
                                                {item.originalName}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">Atau unggah baru</p>
                        <MediaUploader
                            kind={kind}
                            onUploaded={(item) => {
                                setExtra((list) => [item, ...list]);
                                onChange(item.id);
                                setOpen(false);
                            }}
                        />
                    </div>
                </div>
            )}

            {error && (
                <p id={errorId} className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {hint && <p className="text-muted-foreground text-sm">{hint}</p>}
        </div>
    );
}
