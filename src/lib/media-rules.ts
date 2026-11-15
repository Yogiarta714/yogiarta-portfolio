export type MediaKind = "image" | "pdf";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PDF_TYPE = "application/pdf";

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB
export const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_EDGE = 2000; // piksel, sisi terpanjang

/** Folder gambar dan dokumen; nama file akan diberi akhiran acak oleh Blob. */
export const PATHNAME_PATTERN =
    /^(images|documents)\/[a-z0-9][a-z0-9-]{0,80}\.(jpg|png|webp|pdf)$/i;

const EXT_BY_MIME: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
};

export type MediaItem = {
    id: string;
    kind: MediaKind;
    url: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    altText: string | null;
};

export function kindFromMime(mime: string): MediaKind | null {
    if ((IMAGE_TYPES as readonly string[]).includes(mime)) return "image";
    if (mime === PDF_TYPE) return "pdf";
    return null;
}

export function rulesFor(kind: MediaKind) {
    return kind === "image"
        ? {
              allowedTypes: [...IMAGE_TYPES] as string[],
              maxBytes: MAX_IMAGE_BYTES,
          }
        : { allowedTypes: [PDF_TYPE], maxBytes: MAX_PDF_BYTES };
}

/** Nama file aman untuk URL: huruf kecil, angka, tanda hubung. */
export function safeBaseName(originalName: string): string {
    const withoutExt = originalName.replace(/\.[^.]+$/, "");
    const slug = withoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
        .replace(/-+$/g, "");
    return slug || "file";
}

/** Contoh hasil: images/foto-profil.webp atau documents/cv-yogi.pdf */
export function buildPathname(
    kind: MediaKind,
    originalName: string,
    mime: string,
): string {
    const folder = kind === "image" ? "images" : "documents";
    const ext = EXT_BY_MIME[mime] ?? (kind === "image" ? "jpg" : "pdf");
    return `${folder}/${safeBaseName(originalName)}.${ext}`;
}
