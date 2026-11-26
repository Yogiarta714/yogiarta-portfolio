"use server";

import { asc, eq, min } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { moveId } from "@/lib/reorder";
import { socialLinkInputSchema } from "@/lib/validators/social-links";
import { directionSchema, idSchema } from "@/lib/validators/skills";

const SOCIAL_LINKS_PATH = "/admin/social-links";

async function guard(): Promise<ActionResult | null> {
    const admin = await getAdmin();
    return admin
        ? null
        : fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");
}

function done(): ActionResult {
    revalidatePath(SOCIAL_LINKS_PATH);
    revalidatePath("/");
    return ok(null);
}

const invalidId = () => fail("VALIDATION", "Id tidak valid.");
const notFound = () => fail("VALIDATION", "Tautan tidak ditemukan.");

export async function createSocialLinkAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = socialLinkInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const [row] = await db
            .select({ value: min(socialLinks.sortOrder) })
            .from(socialLinks);
        await db.insert(socialLinks).values({
            ...parsed.data,
            sortOrder: (row?.value ?? 1) - 1,
        });
    } catch (error) {
        console.error("createSocialLinkAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan tautan. Coba lagi.");
    }
    return done();
}

export async function updateSocialLinkAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = socialLinkInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const updated = await db
            .update(socialLinks)
            .set(parsed.data)
            .where(eq(socialLinks.id, id))
            .returning({ id: socialLinks.id });
        if (updated.length === 0) return notFound();
    } catch (error) {
        console.error("updateSocialLinkAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan tautan. Coba lagi.");
    }
    return done();
}

export async function deleteSocialLinkAction(
    id: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        await db.delete(socialLinks).where(eq(socialLinks.id, id));
    } catch (error) {
        console.error("deleteSocialLinkAction gagal", error);
        return fail("DATABASE", "Gagal menghapus tautan. Coba lagi.");
    }
    return done();
}

export async function setSocialLinkVisibleAction(
    id: string,
    visible: boolean,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (
        !idSchema.safeParse(id).success ||
        !z.boolean().safeParse(visible).success
    ) {
        return invalidId();
    }

    try {
        const updated = await db
            .update(socialLinks)
            .set({ isVisible: visible })
            .where(eq(socialLinks.id, id))
            .returning({ id: socialLinks.id });
        if (updated.length === 0) return notFound();
    } catch (error) {
        console.error("setSocialLinkVisibleAction gagal", error);
        return fail("DATABASE", "Gagal mengubah tampilan. Coba lagi.");
    }
    return done();
}

export async function moveSocialLinkAction(
    id: string,
    direction: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    const dir = directionSchema.safeParse(direction);
    if (!idSchema.safeParse(id).success || !dir.success) return invalidId();

    try {
        const found = await db.transaction(async (tx) => {
            // Urutan yang sama dengan daftar di layar.
            const rows = await tx
                .select({ id: socialLinks.id })
                .from(socialLinks)
                .orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id));
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(socialLinks)
                    .set({ sortOrder: index })
                    .where(eq(socialLinks.id, rowId));
            }
            return true;
        });
        if (!found) return notFound();
    } catch (error) {
        console.error("moveSocialLinkAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done();
}
