import { upload } from "@vercel/blob/client";
import { registerMediaAction } from "@/actions/media";
import {
    IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    MAX_IMAGE_EDGE,
    MAX_PDF_BYTES,
    PDF_TYPE,
    buildPathname,
    type MediaItem,
    type MediaKind,
} from "@/lib/media-rules";

export class UploadError extends Error {}

type Prepared = {
    blob: Blob;
    mime: string;
    width: number | null;
    height: number | null;
};

function canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
) {
    return new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality),
    );
}

async function prepareImage(file: File): Promise<Prepared> {
    if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
        throw new UploadError("Gambar harus berformat JPG, PNG, atau WebP.");
    }

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file, {
            imageOrientation: "from-image",
        });
    } catch {
        throw new UploadError("Gambar tidak bisa dibaca. Coba file lain.");
    }

    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));

    // Sudah cukup kecil: unggah apa adanya, tanpa kompresi ulang.
    if (scale === 1 && file.size <= MAX_IMAGE_BYTES) {
        bitmap.close();
        return { blob: file, mime: file.type, width, height };
    }

    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        bitmap.close();
        throw new UploadError("Browser tidak mendukung pengolahan gambar.");
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    for (const quality of [0.85, 0.7, 0.55]) {
        const blob = await canvasToBlob(canvas, "image/webp", quality);
        if (
            blob &&
            blob.type === "image/webp" &&
            blob.size <= MAX_IMAGE_BYTES
        ) {
            return { blob, mime: "image/webp", width: w, height: h };
        }
    }
    throw new UploadError(
        "Gambar masih terlalu besar setelah dikecilkan (maksimal 3 MB).",
    );
}

function preparePdf(file: File): Prepared {
    if (file.type !== PDF_TYPE) {
        throw new UploadError("File harus berformat PDF.");
    }
    if (file.size > MAX_PDF_BYTES) {
        throw new UploadError("PDF terlalu besar (maksimal 5 MB).");
    }
    return { blob: file, mime: PDF_TYPE, width: null, height: null };
}

export async function uploadMedia(args: {
    file: File;
    kind: MediaKind;
    altText?: string;
    onProgress?: (percent: number) => void;
}): Promise<MediaItem> {
    const { file, kind, onProgress } = args;
    const prepared =
        kind === "image" ? await prepareImage(file) : preparePdf(file);

    let url: string;
    try {
        const blob = await upload(
            buildPathname(kind, file.name, prepared.mime),
            prepared.blob,
            {
                access: "public",
                handleUploadUrl: "/api/admin/upload",
                clientPayload: JSON.stringify({ kind }),
                contentType: prepared.mime,
                onUploadProgress: ({ percentage }) =>
                    onProgress?.(Math.round(percentage)),
            },
        );
        url = blob.url;
    } catch (error) {
        throw new UploadError(
            error instanceof Error && error.message
                ? `Upload gagal: ${error.message}`
                : "Upload gagal.",
        );
    }

    const result = await registerMediaAction({
        url,
        originalName: file.name,
        width: prepared.width,
        height: prepared.height,
        altText: kind === "image" ? (args.altText ?? "") : null,
    });
    if (!result.ok) throw new UploadError(result.error.message);
    return result.data;
}
