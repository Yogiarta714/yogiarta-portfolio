import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
    media,
    projectMedia,
    projects,
    projectTechnologies,
} from "@/db/schema";
import type { ProjectStatus } from "@/lib/project-publish";
import { idSchema } from "@/lib/validators/skills";

export type ProjectListRow = {
    id: string;
    slug: string;
    title: string;
    category: string;
    projectDate: string;
    status: ProjectStatus;
    isFeatured: boolean;
    sortOrder: number;
    thumbnailUrl: string | null;
    technologyCount: number;
};

export async function listProjects(): Promise<ProjectListRow[]> {
    const [rows, counts] = await Promise.all([
        db
            .select({
                id: projects.id,
                slug: projects.slug,
                title: projects.title,
                category: projects.category,
                projectDate: projects.projectDate,
                status: projects.status,
                isFeatured: projects.isFeatured,
                sortOrder: projects.sortOrder,
                thumbnailUrl: media.blobUrl,
            })
            .from(projects)
            .leftJoin(media, eq(media.id, projects.thumbnailMediaId))
            .orderBy(asc(projects.sortOrder), asc(projects.title)),
        db
            .select({
                projectId: projectTechnologies.projectId,
                total: count(),
            })
            .from(projectTechnologies)
            .groupBy(projectTechnologies.projectId),
    ]);

    const usage = new Map(counts.map((c) => [c.projectId, c.total]));
    return rows.map((r) => ({ ...r, technologyCount: usage.get(r.id) ?? 0 }));
}

export type ProjectEditData = {
    id: string;
    slug: string;
    title: string;
    summary: string;
    descriptionMd: string;
    category: string;
    projectDate: string;
    role: string | null;
    githubUrl: string | null;
    demoUrl: string | null;
    thumbnailMediaId: string | null;
    status: ProjectStatus;
    isFeatured: boolean;
    technologyIds: string[];
    gallery: { mediaId: string; caption: string | null }[];
};

export async function getProjectForEdit(
    id: string,
): Promise<ProjectEditData | null> {
    if (!idSchema.safeParse(id).success) return null;

    const [row] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);
    if (!row) return null;

    const [techs, gallery] = await Promise.all([
        db
            .select({ technologyId: projectTechnologies.technologyId })
            .from(projectTechnologies)
            .where(eq(projectTechnologies.projectId, id)),
        db
            .select({
                mediaId: projectMedia.mediaId,
                caption: projectMedia.caption,
            })
            .from(projectMedia)
            .where(eq(projectMedia.projectId, id))
            .orderBy(asc(projectMedia.sortOrder)),
    ]);

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        descriptionMd: row.descriptionMd,
        category: row.category,
        projectDate: row.projectDate,
        role: row.role,
        githubUrl: row.githubUrl,
        demoUrl: row.demoUrl,
        thumbnailMediaId: row.thumbnailMediaId,
        status: row.status,
        isFeatured: row.isFeatured,
        technologyIds: techs.map((t) => t.technologyId),
        gallery,
    };
}

/** Kategori yang pernah dipakai, untuk saran isian. */
export async function listProjectCategories(): Promise<string[]> {
    const rows = await db
        .selectDistinct({ category: projects.category })
        .from(projects)
        .orderBy(asc(projects.category));
    return rows.map((r) => r.category);
}
