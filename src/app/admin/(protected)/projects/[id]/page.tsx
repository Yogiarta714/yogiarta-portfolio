import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { ProjectForm } from "@/components/admin/project-form";
import { listMedia } from "@/lib/admin-queries/media";
import {
    getProjectForEdit,
    listProjectCategories,
} from "@/lib/admin-queries/projects";
import { getSkillsOverview } from "@/lib/admin-queries/skills";
import { toFormValues } from "@/lib/project-form";

export const metadata: Metadata = { title: "Ubah proyek" };

async function EditProjectLoader({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await connection();

    const [project, overview, library, suggestions] = await Promise.all([
        getProjectForEdit(id),
        getSkillsOverview(),
        listMedia(),
        listProjectCategories(),
    ]);
    if (!project) notFound();

    return (
        <>
            <h1 className="mt-2 text-2xl">{project.title}</h1>
            <div className="pt-6">
                <ProjectForm
                    mode="edit"
                    projectId={project.id}
                    initial={toFormValues(project, "")}
                    categories={overview.categories}
                    technologies={overview.technologies}
                    library={library}
                    categorySuggestions={suggestions}
                />
            </div>
        </>
    );
}

export default function EditProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <div className="max-w-5xl">
            <Link
                href="/admin/projects"
                className="text-muted-foreground hover:text-foreground text-sm"
            >
                ← Semua proyek
            </Link>
            <Suspense fallback={<FormSkeleton sections={4} />}>
                <EditProjectLoader params={params} />
            </Suspense>
        </div>
    );
}
