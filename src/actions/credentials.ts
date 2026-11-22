"use server";

import { asc, desc, eq, min } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { achievements, certificates, media } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { moveId } from "@/lib/reorder";
import {
    achievementInputSchema,
    certificateInputSchema,
} from "@/lib/validators/credentials";
import { directionSchema, idSchema } from "@/lib/validators/skills";

const CERTIFICATES_PATH = "/admin/certificates";
const ACHIEVEMENTS_PATH = "/admin/achievements";

async function guard(): Promise<ActionResult | null> {
    const admin = await getAdmin();
    return admin
        ? null
        : fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");
}

function done(path: string): ActionResult {
    revalidatePath(path);
    revalidatePath("/");
    return ok(null);
}

const invalidId = () => fail("VALIDATION", "Id tidak valid.");
const notFound = (what: string) =>
    fail("VALIDATION", `${what} tidak ditemukan.`);

async function mediaExists(id: string | null): Promise<boolean> {
    if (id === null) return true;
    const [row] = await db
        .select({ id: media.id })
        .from(media)
        .where(eq(media.id, id))
        .limit(1);
    return Boolean(row);
}

const missingFile = () =>
    fail("VALIDATION", "File tidak ditemukan. Pilih ulang.", {
        fileMediaId: ["File tidak ditemukan. Pilih ulang."],
    });

/* ------------------------------ Sertifikat ------------------------------ */

export async function createCertificateAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = certificateInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }
    if (!(await mediaExists(parsed.data.fileMediaId))) return missingFile();

    try {
        const [row] = await db
            .select({ value: min(certificates.sortOrder) })
            .from(certificates);
        await db.insert(certificates).values({
            ...parsed.data,
            sortOrder: (row?.value ?? 1) - 1,
        });
    } catch (error) {
        console.error("createCertificateAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan sertifikat. Coba lagi.");
    }
    return done(CERTIFICATES_PATH);
}

export async function updateCertificateAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = certificateInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }
    if (!(await mediaExists(parsed.data.fileMediaId))) return missingFile();

    try {
        const updated = await db
            .update(certificates)
            .set(parsed.data)
            .where(eq(certificates.id, id))
            .returning({ id: certificates.id });
        if (updated.length === 0) return notFound("Sertifikat");
    } catch (error) {
        console.error("updateCertificateAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan sertifikat. Coba lagi.");
    }
    return done(CERTIFICATES_PATH);
}

export async function deleteCertificateAction(
    id: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        // File-nya tetap ada di perpustakaan media; hanya catatan sertifikat yang dihapus.
        await db.delete(certificates).where(eq(certificates.id, id));
    } catch (error) {
        console.error("deleteCertificateAction gagal", error);
        return fail("DATABASE", "Gagal menghapus sertifikat. Coba lagi.");
    }
    return done(CERTIFICATES_PATH);
}

export async function setCertificateVisibleAction(
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
            .update(certificates)
            .set({ isVisible: visible })
            .where(eq(certificates.id, id))
            .returning({ id: certificates.id });
        if (updated.length === 0) return notFound("Sertifikat");
    } catch (error) {
        console.error("setCertificateVisibleAction gagal", error);
        return fail("DATABASE", "Gagal mengubah tampilan. Coba lagi.");
    }
    return done(CERTIFICATES_PATH);
}

export async function moveCertificateAction(
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
                .select({ id: certificates.id })
                .from(certificates)
                .orderBy(
                    asc(certificates.sortOrder),
                    desc(certificates.issuedDate),
                    asc(certificates.id),
                );
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(certificates)
                    .set({ sortOrder: index })
                    .where(eq(certificates.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Sertifikat");
    } catch (error) {
        console.error("moveCertificateAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done(CERTIFICATES_PATH);
}

/* ------------------------------- Prestasi ------------------------------- */

export async function createAchievementAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = achievementInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const [row] = await db
            .select({ value: min(achievements.sortOrder) })
            .from(achievements);
        await db.insert(achievements).values({
            ...parsed.data,
            sortOrder: (row?.value ?? 1) - 1,
        });
    } catch (error) {
        console.error("createAchievementAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan prestasi. Coba lagi.");
    }
    return done(ACHIEVEMENTS_PATH);
}

export async function updateAchievementAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = achievementInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const updated = await db
            .update(achievements)
            .set(parsed.data)
            .where(eq(achievements.id, id))
            .returning({ id: achievements.id });
        if (updated.length === 0) return notFound("Prestasi");
    } catch (error) {
        console.error("updateAchievementAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan prestasi. Coba lagi.");
    }
    return done(ACHIEVEMENTS_PATH);
}

export async function deleteAchievementAction(
    id: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        await db.delete(achievements).where(eq(achievements.id, id));
    } catch (error) {
        console.error("deleteAchievementAction gagal", error);
        return fail("DATABASE", "Gagal menghapus prestasi. Coba lagi.");
    }
    return done(ACHIEVEMENTS_PATH);
}

export async function setAchievementVisibleAction(
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
            .update(achievements)
            .set({ isVisible: visible })
            .where(eq(achievements.id, id))
            .returning({ id: achievements.id });
        if (updated.length === 0) return notFound("Prestasi");
    } catch (error) {
        console.error("setAchievementVisibleAction gagal", error);
        return fail("DATABASE", "Gagal mengubah tampilan. Coba lagi.");
    }
    return done(ACHIEVEMENTS_PATH);
}

export async function moveAchievementAction(
    id: string,
    direction: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    const dir = directionSchema.safeParse(direction);
    if (!idSchema.safeParse(id).success || !dir.success) return invalidId();

    try {
        const found = await db.transaction(async (tx) => {
            const rows = await tx
                .select({ id: achievements.id })
                .from(achievements)
                .orderBy(
                    asc(achievements.sortOrder),
                    desc(achievements.achievedDate),
                    asc(achievements.id),
                );
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(achievements)
                    .set({ sortOrder: index })
                    .where(eq(achievements.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Prestasi");
    } catch (error) {
        console.error("moveAchievementAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done(ACHIEVEMENTS_PATH);
}
