"use client";

import { useMemo, useState } from "react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MediaItem } from "@/lib/media-rules";
import { moveId } from "@/lib/reorder";

export type GalleryEntry = { mediaId: string; caption: string };

const MAX_GALLERY = 20;

export function GalleryEditor({
    entries,
    library,
    onChange,
    error,
}: {
    entries: GalleryEntry[];
    library: MediaItem[];
    onChange: (entries: GalleryEntry[]) => void;
    error?: string;
}) {
    const [open, setOpen] = useState(false);
    const [extra, setExtra] = useState<MediaItem[]>([]);

    // File yang baru diunggah langsung muncul tanpa menunggu halaman dimuat ulang.
    const all = useMemo(
        () => [
            ...extra,
            ...library.filter((i) => !extra.some((e) => e.id === i.id)),
        ],
        [extra, library],
    );
    const byId = useMemo(() => new Map(all.map((i) => [i.id, i])), [all]);
    const inGallery = new Set(entries.map((e) => e.mediaId));
    const available = all.filter(
        (i) => i.kind === "image" && !inGallery.has(i.id),
    );
    const full = entries.length >= MAX_GALLERY;

    function add(item: MediaItem) {
        if (full || inGallery.has(item.id)) return;
        onChange([...entries, { mediaId: item.id, caption: "" }]);
    }

    function move(mediaId: string, direction: "up" | "down") {
        const next = moveId(
            entries.map((e) => e.mediaId),
            mediaId,
            direction,
        );
        if (!next) return;
        const byMedia = new Map(entries.map((e) => [e.mediaId, e]));
        onChange(next.flatMap((id) => byMedia.get(id) ?? []));
    }

    function setCaption(mediaId: string, caption: string) {
        onChange(
            entries.map((e) => (e.mediaId === mediaId ? { ...e, caption } : e)),
        );
    }

    return (
        <div className="space-y-3">
            {entries.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    Belum ada gambar di galeri.
                </p>
            ) : (
                <ul className="space-y-2">
                    {entries.map((entry, index) => {
                        const item = byId.get(entry.mediaId);
                        const name = item?.originalName ?? "Gambar";
                        return (
                            <li
                                key={entry.mediaId}
                                className="border-border/60 bg-background/40 flex flex-wrap items-center gap-3 rounded-xl border p-3"
                            >
                                {item ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.url}
                                        alt=""
                                        loading="lazy"
                                        className="bg-secondary aspect-video w-24 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="bg-secondary aspect-video w-24 shrink-0 rounded-lg" />
                                )}
                                <div className="min-w-48 flex-1 space-y-1">
                                    <p
                                        className="truncate text-sm font-medium"
                                        title={name}
                                    >
                                        {name}
                                    </p>
                                    <Input
                                        value={entry.caption}
                                        onChange={(e) =>
                                            setCaption(
                                                entry.mediaId,
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Keterangan (opsional)"
                                        aria-label={`Keterangan ${name}`}
                                        maxLength={200}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={index === 0}
                                        aria-label={`Naikkan ${name}`}
                                        onClick={() =>
                                            move(entry.mediaId, "up")
                                        }
                                    >
                                        ↑
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={index === entries.length - 1}
                                        aria-label={`Turunkan ${name}`}
                                        onClick={() =>
                                            move(entry.mediaId, "down")
                                        }
                                    >
                                        ↓
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        aria-label={`Lepas ${name} dari galeri`}
                                        onClick={() =>
                                            onChange(
                                                entries.filter(
                                                    (e) =>
                                                        e.mediaId !==
                                                        entry.mediaId,
                                                ),
                                            )
                                        }
                                    >
                                        Lepas
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={full}
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                >
                    Tambah gambar
                </Button>
                <span className="text-muted-foreground text-sm">
                    {entries.length}/{MAX_GALLERY}
                </span>
            </div>

            {open && (
                <div className="bg-secondary/50 space-y-5 rounded-xl p-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Pilih dari file yang ada
                        </p>
                        {available.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Tidak ada gambar lain di perpustakaan.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {available.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => add(item)}
                                            className="hover:bg-secondary focus-visible:ring-ring w-full space-y-1 rounded-lg border p-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.url}
                                                alt=""
                                                loading="lazy"
                                                className="bg-secondary aspect-video w-full rounded-md object-cover"
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
                            kind="image"
                            onUploaded={(item) => {
                                setExtra((list) => [item, ...list]);
                                add(item);
                            }}
                        />
                    </div>
                </div>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}
