import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import {
    media,
    projectTechnologies,
    projects,
    technologies,
} from "@/db/schema";
import { yearOf } from "@/lib/site-format";

const FEATURED_LIMIT = 3;
const MORE_LIMIT = 4;

/**
 * Proyek untuk halaman utama: maksimal 3 unggulan, lalu maksimal 4 proyek lain
 * (termasuk unggulan yang melebihi 3), ditambah jumlah semua proyek terbit.
 */
export async function getHomeProjects() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    const thumb = alias(media, "thumb");
    const rows = await db
        .select({
            id: projects.id,
            slug: projects.slug,
            title: projects.title,
            summary: projects.summary,
            category: projects.category,
            projectDate: projects.projectDate,
            githubUrl: projects.githubUrl,
            demoUrl: projects.demoUrl,
            isFeatured: projects.isFeatured,
            thumbUrl: thumb.blobUrl,
            thumbAlt: thumb.altText,
        })
        .from(projects)
        .leftJoin(thumb, eq(projects.thumbnailMediaId, thumb.id))
        .where(eq(projects.status, "published"))
        .orderBy(
            desc(projects.isFeatured),
            asc(projects.sortOrder),
            desc(projects.projectDate),
            asc(projects.id),
        );

    const ids = rows.map((r) => r.id);
    const techRows =
        ids.length === 0
            ? []
            : await db
                  .select({
                      projectId: projectTechnologies.projectId,
                      name: technologies.name,
                  })
                  .from(projectTechnologies)
                  .innerJoin(
                      technologies,
                      eq(projectTechnologies.technologyId, technologies.id),
                  )
                  .where(inArray(projectTechnologies.projectId, ids))
                  .orderBy(asc(technologies.sortOrder), asc(technologies.name));

    const techsByProject = new Map<string, string[]>();
    for (const t of techRows) {
        const list = techsByProject.get(t.projectId) ?? [];
        list.push(t.name);
        techsByProject.set(t.projectId, list);
    }

    const all = rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        category: r.category,
        year: yearOf(r.projectDate),
        githubUrl: r.githubUrl,
        demoUrl: r.demoUrl,
        isFeatured: r.isFeatured,
        thumbUrl: r.thumbUrl,
        thumbAlt: r.thumbAlt,
        techs: techsByProject.get(r.id) ?? [],
    }));

    const featured = all.filter((p) => p.isFeatured).slice(0, FEATURED_LIMIT);
    const shown = new Set(featured.map((p) => p.id));
    const more = all.filter((p) => !shown.has(p.id)).slice(0, MORE_LIMIT);

    return { featured, more, total: all.length };
}

export type HomeProject = Awaited<
    ReturnType<typeof getHomeProjects>
>["featured"][number];
