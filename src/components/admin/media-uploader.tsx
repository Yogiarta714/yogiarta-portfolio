"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia } from "@/lib/media-upload";
import {
    IMAGE_TYPES,
    PDF_TYPE,
    type MediaItem,
    type MediaKind,
} from "@/lib/media-rules";
import { cn } from "@/lib/utils";

type Props = {
    kind: MediaKind;
    onUploaded?: (item: MediaItem) => void;
    /** Muat ulang data halaman setelah upload */
    refreshAfterUpload?: boolean;
};

export function MediaUploader({
    kind,
    onUploaded,
    refreshAfterUpload = false,
}: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [alt, setAlt] = useState("");
    const [busy, setBusy] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const accept = kind === "image" ? IMAGE_TYPES.join(",") : PDF_TYPE;
    const limitLabel =
        kind === "image"
            ? "JPG, PNG, atau WebP · otomatis dikecilkan ke 2000 px · maks 3 MB"
            : "PDF · maks 5 MB";

    async function handleFile(file: File | undefined) {
        if (!file || busy) return;
        setError(null);
        setDone(null);
        setProgress(0);
        setBusy(true);
        try {
            const item = await uploadMedia({
                file,
                kind,
                altText: alt,
                onProgress: setProgress,
            });
            setDone(`${item.originalName} berhasil diunggah.`);
            setAlt("");
            onUploaded?.(item);
            if (refreshAfterUpload) router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Upload gagal.");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-3">
            {kind === "image" && (
                <div className="space-y-1.5">
                    <Label htmlFor={`alt-${kind}`}>
                        Teks alternatif (opsional)
                    </Label>
                    <Input
                        id={`alt-${kind}`}
                        className="h-11 text-base"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                        disabled={busy}
                        aria-describedby={`alt-${kind}-hint`}
                    />
                    <p
                        id={`alt-${kind}-hint`}
                        className="text-muted-foreground text-sm"
                    >
                        Deskripsi singkat gambar untuk pembaca layar dan SEO.
                        Isi sebelum memilih file.
                    </p>
                </div>
            )}

            <label
                className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                    "has-focus-visible:ring-ring has-focus-visible:ring-2",
                    dragging
                        ? "border-primary bg-secondary"
                        : "border-input hover:bg-secondary",
                    busy && "pointer-events-none opacity-70",
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    void handleFile(e.dataTransfer.files[0]);
                }}
            >
                <span className="font-medium">
                    {busy
                        ? progress === 0
                            ? "Menyiapkan file…"
                            : `Mengunggah… ${progress}%`
                        : kind === "image"
                          ? "Pilih atau seret gambar"
                          : "Pilih atau seret PDF"}
                </span>
                <span className="text-muted-foreground text-sm">
                    {limitLabel}
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="sr-only"
                    disabled={busy}
                    onChange={(e) => void handleFile(e.target.files?.[0])}
                />
            </label>

            {busy && (
                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className="bg-secondary h-2 overflow-hidden rounded-full"
                >
                    <div
                        className="bg-primary h-full transition-[width]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {done && (
                <p role="status" className="text-sm">
                    {done}
                </p>
            )}
        </div>
    );
}
