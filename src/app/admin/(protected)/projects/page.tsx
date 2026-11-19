import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { ProjectsManager } from "@/components/admin/projects-manager";
import { listProjects } from "@/lib/admin-queries/projects";

export const metadata: Metadata = { title: "Proyek" };

async function ProjectsLoader() {
    await connection();
    const projects = await listProjects();
    return <ProjectsManager projects={projects} />;
}

export default function ProjectsPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl">Proyek</h1>
                    <p className="text-muted-foreground text-sm">
                        Atur proyek yang tampil di situs: status, unggulan, dan
                        urutan.
                    </p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                >
                    Proyek baru
                </Link>
            </div>
            <Suspense fallback={<FormSkeleton sections={3} />}>
                <ProjectsLoader />
            </Suspense>
        </div>
    );
}
