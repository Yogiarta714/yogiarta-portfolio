"use server";

import { asc, desc, eq, min } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { education, experiences } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { moveId } from "@/lib/reorder";
import {
    educationInputSchema,
    experienceInputSchema,
} from "@/lib/validators/career";
import { directionSchema, idSchema } from "@/lib/validators/skills";

const EXPERIENCE_PATH = "/admin/experience";
const EDUCATION_PATH = "/admin/education";

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

/* ------------------------------ Pengalaman ------------------------------ */

export async function createExperienceAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = experienceInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        // Data baru ditaruh paling atas: urutannya satu di bawah yang terkecil.
        const [row] = await db
            .select({ value: min(experiences.sortOrder) })
            .from(experiences);
        await db.insert(experiences).values({
            ...parsed.data,
            sortOrder: (row?.value ?? 1) - 1,
        });
    } catch (error) {
        console.error("createExperienceAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan pengalaman. Coba lagi.");
    }
    return done(EXPERIENCE_PATH);
}

export async function updateExperienceAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = experienceInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const updated = await db
            .update(experiences)
            .set(parsed.data)
            .where(eq(experiences.id, id))
            .returning({ id: experiences.id });
        if (updated.length === 0) return notFound("Pengalaman");
    } catch (error) {
        console.error("updateExperienceAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan pengalaman. Coba lagi.");
    }
    return done(EXPERIENCE_PATH);
}

export async function deleteExperienceAction(
    id: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        await db.delete(experiences).where(eq(experiences.id, id));
    } catch (error) {
        console.error("deleteExperienceAction gagal", error);
        return fail("DATABASE", "Gagal menghapus pengalaman. Coba lagi.");
    }
    return done(EXPERIENCE_PATH);
}

export async function setExperienceVisibleAction(
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
            .update(experiences)
            .set({ isVisible: visible })
            .where(eq(experiences.id, id))
            .returning({ id: experiences.id });
        if (updated.length === 0) return notFound("Pengalaman");
    } catch (error) {
        console.error("setExperienceVisibleAction gagal", error);
        return fail("DATABASE", "Gagal mengubah tampilan. Coba lagi.");
    }
    return done(EXPERIENCE_PATH);
}

export async function moveExperienceAction(
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
                .select({ id: experiences.id })
                .from(experiences)
                .orderBy(
                    asc(experiences.sortOrder),
                    desc(experiences.startDate),
                    asc(experiences.id),
                );
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(experiences)
                    .set({ sortOrder: index })
                    .where(eq(experiences.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Pengalaman");
    } catch (error) {
        console.error("moveExperienceAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done(EXPERIENCE_PATH);
}

/* ------------------------------ Pendidikan ------------------------------ */

export async function createEducationAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = educationInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const [row] = await db
            .select({ value: min(education.sortOrder) })
            .from(education);
        await db.insert(education).values({
            ...parsed.data,
            sortOrder: (row?.value ?? 1) - 1,
        });
    } catch (error) {
        console.error("createEducationAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan pendidikan. Coba lagi.");
    }
    return done(EDUCATION_PATH);
}

export async function updateEducationAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = educationInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const updated = await db
            .update(education)
            .set(parsed.data)
            .where(eq(education.id, id))
            .returning({ id: education.id });
        if (updated.length === 0) return notFound("Pendidikan");
    } catch (error) {
        console.error("updateEducationAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan pendidikan. Coba lagi.");
    }
    return done(EDUCATION_PATH);
}

export async function deleteEducationAction(id: string): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        await db.delete(education).where(eq(education.id, id));
    } catch (error) {
        console.error("deleteEducationAction gagal", error);
        return fail("DATABASE", "Gagal menghapus pendidikan. Coba lagi.");
    }
    return done(EDUCATION_PATH);
}

export async function setEducationVisibleAction(
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
            .update(education)
            .set({ isVisible: visible })
            .where(eq(education.id, id))
            .returning({ id: education.id });
        if (updated.length === 0) return notFound("Pendidikan");
    } catch (error) {
        console.error("setEducationVisibleAction gagal", error);
        return fail("DATABASE", "Gagal mengubah tampilan. Coba lagi.");
    }
    return done(EDUCATION_PATH);
}

export async function moveEducationAction(
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
                .select({ id: education.id })
                .from(education)
                .orderBy(
                    asc(education.sortOrder),
                    desc(education.startYear),
                    asc(education.id),
                );
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(education)
                    .set({ sortOrder: index })
                    .where(eq(education.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Pendidikan");
    } catch (error) {
        console.error("moveEducationAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done(EDUCATION_PATH);
}
