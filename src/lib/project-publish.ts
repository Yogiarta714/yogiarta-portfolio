export type ProjectStatus = "draft" | "published";

// Waktu terbit: terisi saat pertama kali dipublikasikan

export function resolvePublishedAt(
    status: ProjectStatus,
    existing: Date | null,
    now: Date,
): Date | null {
    if (status === "published") return existing ?? now;
    return existing;
}
