import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { ProjectForm } from "@/components/admin/project-form";
import { listMedia } from "@/lib/admin-queries/media";
import { listProjectCategories } from "@/lib/admin-queries/projects";
import { getSkillsOverview } from "@/lib/admin-queries/skills";
import { toFormValues } from "@/lib/project-form";

export const metadata: Metadata = { title: "Proyek baru" };

async function NewProjectLoader() {
    await connection();
    const [overview, library, suggestions] = await Promise.all([
        getSkillsOverview(),
        listMedia(),
        listProjectCategories(),
    ]);
    const today = new Date().toISOString().slice(0, 10);

    return (
        <ProjectForm
            mode="new"
            projectId={null}
            initial={toFormValues(null, today)}
            categories={overview.categories}
            technologies={overview.technologies}
            library={library}
            categorySuggestions={suggestions}
        />
    );
}

export default function NewProjectPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <Link
                    href="/admin/projects"
                    className="text-muted-foreground hover:text-foreground text-sm"
                >
                    ← Semua proyek
                </Link>
                <h1 className="mt-2 text-2xl">Proyek baru</h1>
            </div>
            <Suspense fallback={<FormSkeleton sections={4} />}>
                <NewProjectLoader />
            </Suspense>
        </div>
    );
}
