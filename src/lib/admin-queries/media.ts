import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
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
