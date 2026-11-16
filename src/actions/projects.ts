"use server";

import { and, asc, eq, inArray, max, notInArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
    media,
    projectMedia,
    projects,
    projectTechnologies,
} from "@/db/schema";
import {
    fail,
    ok,
    type ActionResult,
    type FieldErrors,
} from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";
import { resolvePublishedAt } from "@/lib/project-publish";
import { moveId } from "@/lib/reorder";
import {
    projectInputSchema,
    type ProjectData,
} from "@/lib/validators/projects";
import { directionSchema, idSchema } from "@/lib/validators/skills";

const unauthorized = () =>
    fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");
const invalidId = () => fail("VALIDATION", "Id tidak valid.");
const notFound = () => fail("VALIDATION", "Proyek tidak ditemukan.");

function revalidateAll() {
    revalidatePath("/admin/projects");
    revalidatePath("/");
    revalidatePath("/projects", "layout");
}

/** Thumbnail dan galeri harus ada dan berupa gambar. */
async function checkMedia(data: ProjectData): Promise<FieldErrors | null> {
    const ids = [
        ...(data.thumbnailMediaId ? [data.thumbnailMediaId] : []),
        ...data.gallery.map((g) => g.mediaId),
    ];
    if (ids.length === 0) return null;

    const rows = await db
        .select({ id: media.id, kind: media.kind })
        .from(media)
        .where(inArray(media.id, [...new Set(ids)]));
    const kindById = new Map(rows.map((r) => [r.id, r.kind]));

    const errors: FieldErrors = {};
    if (data.thumbnailMediaId) {
        const kind = kindById.get(data.thumbnailMediaId);
        if (!kind)
            errors.thumbnailMediaId = ["Thumbnail: file tidak ditemukan"];
        else if (kind !== "image")
            errors.thumbnailMediaId = ["Thumbnail harus berupa gambar"];
    }
    if (data.gallery.some((g) => kindById.get(g.mediaId) !== "image")) {
        errors.gallery = [
            "Galeri berisi file yang tidak ditemukan atau bukan gambar",
        ];
    }
    return Object.keys(errors).length > 0 ? errors : null;
}

/** Buat (id = null) atau ubah proyek, lengkap dengan teknologi dan galerinya, dalam satu transaksi. */
export async function saveProjectAction(
    id: string | null,
    input: unknown,
): Promise<ActionResult<{ id: string }>> {
    if (!(await getAdmin())) return unauthorized();
    if (id !== null && !idSchema.safeParse(id).success) return invalidId();

    const parsed = projectInputSchema.safeParse(input);
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian yang ditandai.",
            parsed.error.flatten().fieldErrors,
        );
    }
    const data = parsed.data;

    try {
        const mediaErrors = await checkMedia(data);
        if (mediaErrors) {
            return fail(
                "VALIDATION",
                "Periksa kembali isian yang ditandai.",
                mediaErrors,
            );
        }

        const fields = {
            slug: data.slug,
            title: data.title,
            summary: data.summary,
            descriptionMd: data.descriptionMd,
            category: data.category,
            projectDate: data.projectDate,
            role: data.role,
            githubUrl: data.githubUrl,
            demoUrl: data.demoUrl,
            thumbnailMediaId: data.thumbnailMediaId,
            status: data.status,
            isFeatured: data.isFeatured,
        };

        const savedId = await db.transaction(async (tx) => {
            let projectId: string;

            if (id) {
                const [existing] = await tx
                    .select({ publishedAt: projects.publishedAt })
                    .from(projects)
                    .where(eq(projects.id, id))
                    .limit(1);
                if (!existing) return null;

                await tx
                    .update(projects)
                    .set({
                        ...fields,
                        publishedAt: resolvePublishedAt(
                            data.status,
                            existing.publishedAt,
                            new Date(),
                        ),
                        updatedAt: sql`now()`,
                    })
                    .where(eq(projects.id, id));
                projectId = id;
            } else {
                const [last] = await tx
                    .select({ value: max(projects.sortOrder) })
                    .from(projects);
                const [created] = await tx
                    .insert(projects)
                    .values({
                        ...fields,
                        publishedAt: resolvePublishedAt(
                            data.status,
                            null,
                            new Date(),
                        ),
                        sortOrder: (last?.value ?? -1) + 1,
                    })
                    .returning({ id: projects.id });
                projectId = created.id;
            }

            // Teknologi: ganti seluruh daftar.
            await tx
                .delete(projectTechnologies)
                .where(eq(projectTechnologies.projectId, projectId));
            if (data.technologyIds.length > 0) {
                await tx.insert(projectTechnologies).values(
                    data.technologyIds.map((technologyId) => ({
                        projectId,
                        technologyId,
                    })),
                );
            }

            // Galeri: buang yang tidak ada lagi, lalu simpan urutan dan keterangan yang baru.
            const galleryIds = data.gallery.map((g) => g.mediaId);
            await tx
                .delete(projectMedia)
                .where(
                    galleryIds.length > 0
                        ? and(
                              eq(projectMedia.projectId, projectId),
                              notInArray(projectMedia.mediaId, galleryIds),
                          )
                        : eq(projectMedia.projectId, projectId),
                );
            for (const [index, item] of data.gallery.entries()) {
                await tx
                    .insert(projectMedia)
                    .values({
                        projectId,
                        mediaId: item.mediaId,
                        caption: item.caption,
                        sortOrder: index,
                    })
                    .onConflictDoUpdate({
                        target: [projectMedia.projectId, projectMedia.mediaId],
                        set: { caption: item.caption, sortOrder: index },
                    });
            }

            return projectId;
        });

        if (!savedId) return notFound();
        revalidateAll();
        revalidatePath(`/admin/projects/${savedId}`);
        return ok({ id: savedId });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return fail("CONFLICT", "Slug sudah dipakai proyek lain.", {
                slug: ["Slug sudah dipakai proyek lain"],
            });
        }
        if (isForeignKeyViolation(error)) {
            return fail("VALIDATION", "Periksa kembali isian yang ditandai.", {
                technologyIds: ["Ada teknologi yang tidak ditemukan"],
            });
        }
        console.error("saveProjectAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan proyek. Coba lagi.");
    }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
    if (!(await getAdmin())) return unauthorized();
    if (!idSchema.safeParse(id).success) return invalidId();

    try {
        // Teknologi dan galeri ikut terhapus (cascade); file di perpustakaan Media tidak.
        await db.delete(projects).where(eq(projects.id, id));
    } catch (error) {
        console.error("deleteProjectAction gagal", error);
        return fail("DATABASE", "Gagal menghapus proyek. Coba lagi.");
    }
    revalidateAll();
    return ok(null);
}

export async function setProjectStatusAction(
    id: string,
    status: string,
): Promise<ActionResult> {
    if (!(await getAdmin())) return unauthorized();
    const parsedStatus = projectInputSchema.shape.status.safeParse(status);
    if (!idSchema.safeParse(id).success || !parsedStatus.success)
        return invalidId();

    try {
        const [existing] = await db
            .select({ publishedAt: projects.publishedAt })
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        if (!existing) return notFound();

        await db
            .update(projects)
            .set({
                status: parsedStatus.data,
                publishedAt: resolvePublishedAt(
                    parsedStatus.data,
                    existing.publishedAt,
                    new Date(),
                ),
                updatedAt: sql`now()`,
            })
            .where(eq(projects.id, id));
    } catch (error) {
        console.error("setProjectStatusAction gagal", error);
        return fail("DATABASE", "Gagal mengubah status. Coba lagi.");
    }
    revalidateAll();
    return ok(null);
}

export async function setProjectFeaturedAction(
    id: string,
    featured: boolean,
): Promise<ActionResult> {
    if (!(await getAdmin())) return unauthorized();
    if (!idSchema.safeParse(id).success || typeof featured !== "boolean")
        return invalidId();

    try {
        const updated = await db
            .update(projects)
            .set({ isFeatured: featured, updatedAt: sql`now()` })
            .where(eq(projects.id, id))
            .returning({ id: projects.id });
        if (updated.length === 0) return notFound();
    } catch (error) {
        console.error("setProjectFeaturedAction gagal", error);
        return fail("DATABASE", "Gagal mengubah status unggulan. Coba lagi.");
    }
    revalidateAll();
    return ok(null);
}

export async function moveProjectAction(
    id: string,
    direction: string,
): Promise<ActionResult> {
    if (!(await getAdmin())) return unauthorized();
    const dir = directionSchema.safeParse(direction);
    if (!idSchema.safeParse(id).success || !dir.success) return invalidId();

    try {
        const found = await db.transaction(async (tx) => {
            const rows = await tx
                .select({ id: projects.id })
                .from(projects)
                .orderBy(asc(projects.sortOrder), asc(projects.title));
            const next = moveId(
                rows.map((r) => r.id),
                id,
                dir.data,
            );
            if (!next) return false;
            for (const [index, rowId] of next.entries()) {
                await tx
                    .update(projects)
                    .set({ sortOrder: index })
                    .where(eq(projects.id, rowId));
            }
            return true;
        });
        if (!found) return notFound();
    } catch (error) {
        console.error("moveProjectAction gagal", error);
        return fail("DATABASE", "Gagal mengubah urutan. Coba lagi.");
    }
    revalidateAll();
    return ok(null);
}
