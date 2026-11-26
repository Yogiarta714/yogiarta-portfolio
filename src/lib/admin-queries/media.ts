import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
    media,
    profile,
    projectMedia,
    projects,
    certificates,
} from "@/db/schema";
import type { MediaItem } from "@/lib/media-rules";

type MediaRow = typeof media.$inferSelect;

export function toMediaItem(row: MediaRow): MediaItem {
    return {
        id: row.id,
        kind: row.kind,
        url: row.blobUrl,
        originalName: row.originalName,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        width: row.width,
        height: row.height,
        altText: row.altText,
    };
}

export async function listMedia(): Promise<MediaItem[]> {
    const rows = await db.select().from(media).orderBy(desc(media.createdAt));
    return rows.map(toMediaItem);
}

/**
 * Daftar tempat sebuah file masih dipakai. WAJIB diperluas setiap kali ada tabel
 * baru yang menunjuk ke media (proyek, sertifikat, dst.), supaya file tidak terhapus
 * saat masih dipakai.
 */
export async function findMediaUsage(id: string): Promise<string[]> {
    const [row] = await db
        .select({
            avatar: profile.avatarMediaId,
            cv: profile.cvMediaId,
            og: profile.ogImageMediaId,
        })
        .from(profile)
        .limit(1);

    const used: string[] = [];
    if (row?.avatar === id) used.push("Foto profil");
    if (row?.cv === id) used.push("CV");
    if (row?.og === id) used.push("Gambar OG");

    const [thumbnails, galleries, certs] = await Promise.all([
        db
            .select({ title: projects.title })
            .from(projects)
            .where(eq(projects.thumbnailMediaId, id)),
        db
            .select({ title: projects.title })
            .from(projectMedia)
            .innerJoin(projects, eq(projects.id, projectMedia.projectId))
            .where(eq(projectMedia.mediaId, id)),
        db
            .select({ title: certificates.title })
            .from(certificates)
            .where(eq(certificates.fileMediaId, id)),
    ]);
    for (const p of thumbnails) used.push(`Thumbnail proyek “${p.title}”`);
    for (const p of galleries) used.push(`Galeri proyek “${p.title}”`);
    for (const c of certs) used.push(`Sertifikat “${c.title}”`);

    return used;
}
