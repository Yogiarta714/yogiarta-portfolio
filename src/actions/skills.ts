"use server";

import { and, asc, eq, isNull, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
    projects,
    projectTechnologies,
    skillCategories,
    technologies,
} from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";
import { moveId } from "@/lib/reorder";
import { slugify } from "@/lib/slug";
import {
    categoryInputSchema,
    directionSchema,
    idSchema,
    technologyInputSchema,
} from "@/lib/validators/skills";

async function guard(): Promise<ActionResult | null> {
    const admin = await getAdmin();
    return admin
        ? null
        : fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");
}

function done(): ActionResult {
    revalidatePath("/admin/skills");
    revalidatePath("/");
    return ok(null);
}

const invalidId = () => fail("VALIDATION", "Id tidak valid.");
const notFound = (what: string) =>
    fail("VALIDATION", `${what} tidak ditemukan.`);

/* ------------------------------ Kategori ------------------------------ */

export async function createCategoryAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const [row] = await db
            .select({ value: max(skillCategories.sortOrder) })
            .from(skillCategories);
        await db.insert(skillCategories).values({
            name: parsed.data.name,
            sortOrder: (row?.value ?? -1) + 1,
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return fail("CONFLICT", "Nama kategori sudah dipakai.", {
                name: ["Nama kategori sudah dipakai"],
            });
        }
        console.error("createCategoryAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan kategori. Coba lagi.");
    }
    return done();
}

export async function renameCategoryAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = categoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        const updated = await db
            .update(skillCategories)
            .set({ name: parsed.data.name })
            .where(eq(skillCategories.id, id))
            .returning({ id: skillCategories.id });
        if (updated.length === 0) return notFound("Kategori");
    } catch (error) {
        if (isUniqueViolation(error)) {
            return fail("CONFLICT", "Nama kategori sudah dipakai.", {
                name: ["Nama kategori sudah dipakai"],
            });
        }
        console.error("renameCategoryAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan kategori. Coba lagi.");
    }
    return done();
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        // Teknologi di dalamnya tidak ikut terhapus: kolom kategorinya menjadi kosong (set null).
        await db.delete(skillCategories).where(eq(skillCategories.id, id));
    } catch (error) {
        console.error("deleteCategoryAction gagal", error);
        return fail("DATABASE", "Gagal menghapus kategori. Coba lagi.");
    }
    return done();
}

export async function moveCategoryAction(
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
                .select({ id: skillCategories.id })
                .from(skillCategories)
                .orderBy(
                    asc(skillCategories.sortOrder),
                    asc(skillCategories.name),
                );
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(skillCategories)
                    .set({ sortOrder: index })
                    .where(eq(skillCategories.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Kategori");
    } catch (error) {
        console.error("moveCategoryAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done();
}

/* ------------------------------ Teknologi ----------------------------- */

function sameGroup(categoryId: string | null) {
    return categoryId
        ? eq(technologies.categoryId, categoryId)
        : isNull(technologies.categoryId);
}

async function nextSortOrder(categoryId: string | null): Promise<number> {
    const [row] = await db
        .select({ value: max(technologies.sortOrder) })
        .from(technologies)
        .where(sameGroup(categoryId));
    return (row?.value ?? -1) + 1;
}

export async function createTechnologyAction(
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;

    const parsed = technologyInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }
    const { name, categoryId, showInSkills } = parsed.data;

    const slug = slugify(name);
    if (!slug) {
        return fail("VALIDATION", "Periksa kembali isian.", {
            name: ["Nama harus memuat huruf atau angka"],
        });
    }

    try {
        await db.insert(technologies).values({
            name,
            slug,
            categoryId,
            showInSkills,
            sortOrder: await nextSortOrder(categoryId),
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return fail("CONFLICT", "Nama teknologi sudah dipakai.", {
                name: ["Nama teknologi sudah dipakai"],
            });
        }
        if (isForeignKeyViolation(error)) return notFound("Kategori");
        console.error("createTechnologyAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan teknologi. Coba lagi.");
    }
    return done();
}

export async function updateTechnologyAction(
    id: string,
    input: unknown,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    const parsed = technologyInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian.",
            parsed.error.flatten().fieldErrors,
        );
    }
    const { name, categoryId, showInSkills } = parsed.data;

    try {
        const [current] = await db
            .select({ categoryId: technologies.categoryId })
            .from(technologies)
            .where(eq(technologies.id, id))
            .limit(1);
        if (!current) return notFound("Teknologi");

        // Pindah kategori: taruh di urutan paling akhir kategori baru. Slug tidak diubah.
        const moved = current.categoryId !== categoryId;
        await db
            .update(technologies)
            .set({
                name,
                categoryId,
                showInSkills,
                ...(moved
                    ? { sortOrder: await nextSortOrder(categoryId) }
                    : {}),
            })
            .where(eq(technologies.id, id));
    } catch (error) {
        if (isUniqueViolation(error)) {
            return fail("CONFLICT", "Nama teknologi sudah dipakai.", {
                name: ["Nama teknologi sudah dipakai"],
            });
        }
        if (isForeignKeyViolation(error)) return notFound("Kategori");
        console.error("updateTechnologyAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan teknologi. Coba lagi.");
    }
    return done();
}

export async function deleteTechnologyAction(
    id: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        // project_technologies memakai ON DELETE CASCADE, jadi database TIDAK akan menolak.
        // Pengecekan ini satu-satunya pelindung agar teknologi tidak lepas diam-diam dari proyek.
        const used = await db
            .select({ title: projects.title })
            .from(projectTechnologies)
            .innerJoin(projects, eq(projects.id, projectTechnologies.projectId))
            .where(eq(projectTechnologies.technologyId, id))
            .orderBy(asc(projects.title));

        if (used.length > 0) {
            const shown = used
                .slice(0, 5)
                .map((p) => p.title)
                .join(", ");
            const rest =
                used.length > 5 ? ` dan ${used.length - 5} lainnya` : "";
            return fail(
                "CONFLICT",
                `Masih dipakai proyek: ${shown}${rest}. Lepaskan dulu dari proyek itu.`,
            );
        }

        await db.delete(technologies).where(eq(technologies.id, id));
    } catch (error) {
        console.error("deleteTechnologyAction gagal", error);
        return fail("DATABASE", "Gagal menghapus teknologi. Coba lagi.");
    }
    return done();
}

export async function moveTechnologyAction(
    id: string,
    direction: string,
): Promise<ActionResult> {
    const denied = await guard();
    if (denied) return denied;
    const dir = directionSchema.safeParse(direction);
    if (!idSchema.safeParse(id).success || !dir.success) return invalidId();

    try {
        const found = await db.transaction(async (tx) => {
            const [current] = await tx
                .select({ categoryId: technologies.categoryId })
                .from(technologies)
                .where(eq(technologies.id, id))
                .limit(1);
            if (!current) return false;

            // Urutan hanya berlaku di dalam kelompok kategori yang sama.
            const siblings = await tx
                .select({ id: technologies.id })
                .from(technologies)
                .where(and(sameGroup(current.categoryId)))
                .orderBy(asc(technologies.sortOrder), asc(technologies.name));
            const next = moveId(
                siblings.map((s) => s.id),
                id,
                dir.data,
            );
            if (!next) return false;

            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(technologies)
                    .set({ sortOrder: index })
                    .where(eq(technologies.id, rowId));
            }
            return true;
        });
        if (!found) return notFound("Teknologi");
    } catch (error) {
        console.error("moveTechnologyAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    return done();
}
