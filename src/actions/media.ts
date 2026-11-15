"use server";

import { del, head } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { media } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import {
    PATHNAME_PATTERN,
    kindFromMime,
    rulesFor,
    type MediaItem,
} from "@/lib/media-rules";

const registerSchema = z.object({
    url: z.string().url(),
    originalName: z.string().trim().min(1).max(200),
    width: z.number().int().positive().max(20000).nullable(),
    height: z.number().int().positive().max(20000).nullable(),
    altText: z
        .string()
        .trim()
        .max(200)
        .transform((v) => (v === "" ? null : v))
        .nullable(),
});

export type RegisterMediaInput = z.input<typeof registerSchema>;

type MediaRow = typeof media.$inferSelect;

function toItem(row: MediaRow): MediaItem {
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

/** Dipanggil browser setelah upload ke Blob selesai. Server memeriksa file aslinya sebelum dicatat. */
export async function registerMediaAction(
    input: RegisterMediaInput,
): Promise<ActionResult<MediaItem>> {
    const admin = await getAdmin();
    if (!admin)
        return fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");

    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Data file tidak valid.",
            parsed.error.flatten().fieldErrors,
        );
    }
    const data = parsed.data;

    let meta: Awaited<ReturnType<typeof head>>;
    try {
        meta = await head(data.url);
    } catch {
        return fail("VALIDATION", "File tidak ditemukan di penyimpanan.");
    }

    const kind = kindFromMime(meta.contentType);
    const valid =
        kind !== null &&
        PATHNAME_PATTERN.test(meta.pathname) &&
        meta.size <= rulesFor(kind).maxBytes;

    if (!valid) {
        // File yang melanggar aturan tidak boleh tersisa di penyimpanan.
        await del(data.url).catch(() => undefined);
        return fail("VALIDATION", "Jenis atau ukuran file tidak diizinkan.");
    }

    try {
        const [inserted] = await db
            .insert(media)
            .values({
                kind,
                blobUrl: meta.url,
                blobPathname: meta.pathname,
                originalName: data.originalName,
                mimeType: meta.contentType,
                sizeBytes: meta.size,
                width: kind === "image" ? data.width : null,
                height: kind === "image" ? data.height : null,
                altText: kind === "image" ? data.altText : null,
            })
            .onConflictDoNothing()
            .returning();

        if (inserted) return ok(toItem(inserted));

        // URL yang sama sudah tercatat: kembalikan barisnya (aman diulang).
        const [existing] = await db
            .select()
            .from(media)
            .where(eq(media.blobUrl, meta.url))
            .limit(1);
        if (existing) return ok(toItem(existing));
        return fail("CONFLICT", "File sudah tercatat dengan data lain.");
    } catch (error) {
        console.error("registerMediaAction gagal", error);
        return fail("DATABASE", "Gagal mencatat file. Coba lagi.");
    }
}
