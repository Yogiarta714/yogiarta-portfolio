import type { ProjectEditData } from "@/lib/admin-queries/projects";
import type { ProjectStatus } from "@/lib/project-publish";
import type { ProjectInput } from "@/lib/validators/projects";

export type ProjectFormValues = {
    title: string;
    slug: string;
    summary: string;
    descriptionMd: string;
    category: string;
    projectDate: string;
    role: string;
    githubUrl: string;
    demoUrl: string;
    thumbnailMediaId: string;
    status: ProjectStatus;
    isFeatured: boolean;
    technologyIds: string[];
    gallery: { mediaId: string; caption: string }[];
};

/** Nilai awal form: dari proyek yang ada, atau kosong untuk proyek baru. */
export function toFormValues(
    project: ProjectEditData | null,
    today: string,
): ProjectFormValues {
    if (!project) {
        return {
            title: "",
            slug: "",
            summary: "",
            descriptionMd: "",
            category: "",
            projectDate: today,
            role: "",
            githubUrl: "",
            demoUrl: "",
            thumbnailMediaId: "",
            status: "draft",
            isFeatured: false,
            technologyIds: [],
            gallery: [],
        };
    }
    return {
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        descriptionMd: project.descriptionMd,
        category: project.category,
        projectDate: project.projectDate,
        role: project.role ?? "",
        githubUrl: project.githubUrl ?? "",
        demoUrl: project.demoUrl ?? "",
        thumbnailMediaId: project.thumbnailMediaId ?? "",
        status: project.status,
        isFeatured: project.isFeatured,
        technologyIds: project.technologyIds,
        gallery: project.gallery.map((g) => ({
            mediaId: g.mediaId,
            caption: g.caption ?? "",
        })),
    };
}

/** Data yang dikirim ke Server Action: thumbnail kosong menjadi null. */
export function toActionInput(values: ProjectFormValues): ProjectInput {
    return { ...values, thumbnailMediaId: values.thumbnailMediaId || null };
}
