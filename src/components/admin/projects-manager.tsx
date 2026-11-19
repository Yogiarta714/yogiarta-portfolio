"use client";

import Link from "next/link";
import { useState } from "react";
import {
    deleteProjectAction,
    moveProjectAction,
    setProjectFeaturedAction,
    setProjectStatusAction,
} from "@/actions/projects";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { MoveButtons } from "@/components/admin/move-buttons";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import type { ProjectListRow } from "@/lib/admin-queries/projects";
import { cn } from "@/lib/utils";

type Filter = "all" | "published" | "draft";

function RowAction({
    label,
    ariaLabel,
    action,
    variant = "ghost",
    pressed,
}: {
    label: string;
    ariaLabel: string;
    action: () => Promise<ActionResult>;
    variant?: "ghost" | "secondary";
    pressed?: boolean;
}) {
    const { pending, error, run } = useAction();
    return (
        <div className="space-y-1">
            <Button
                type="button"
                variant={variant}
                size="sm"
                disabled={pending}
                aria-pressed={pressed}
                aria-label={ariaLabel}
                onClick={() => run(action)}
            >
                {label}
            </Button>
            {error && (
                <p role="alert" className="text-destructive max-w-56 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}

function Badge({
    children,
    tone,
}: {
    children: React.ReactNode;
    tone: "primary" | "muted" | "danger";
}) {
    return (
        <span
            className={cn(
                "rounded-full border px-2 py-0.5 text-xs",
                tone === "primary" && "border-primary/40 text-primary",
                tone === "muted" && "border-border text-muted-foreground",
                tone === "danger" && "border-destructive/50 text-destructive",
            )}
        >
            {children}
        </span>
    );
}

function ProjectRow({
    project,
    index,
    total,
    reorderable,
}: {
    project: ProjectListRow;
    index: number;
    total: number;
    reorderable: boolean;
}) {
    const published = project.status === "published";

    return (
        <li className="bg-card border-border/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
                {project.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={project.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        className="bg-secondary aspect-video w-full shrink-0 rounded-xl object-cover sm:w-44"
                    />
                ) : (
                    <div className="bg-secondary text-muted-foreground grid aspect-video w-full shrink-0 place-items-center rounded-xl text-sm sm:w-44">
                        Tanpa thumbnail
                    </div>
                )}

                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-sans text-lg leading-tight font-semibold">
                            {project.title}
                        </h3>
                        <Badge tone={published ? "primary" : "muted"}>
                            {published ? "Terbit" : "Draft"}
                        </Badge>
                        {project.isFeatured && (
                            <Badge tone="primary">Unggulan</Badge>
                        )}
                        {published && !project.thumbnailUrl && (
                            <Badge tone="danger">Belum ada thumbnail</Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {project.category} · {project.projectDate.slice(0, 4)} ·{" "}
                        {project.technologyCount} teknologi
                    </p>
                    <p className="text-muted-foreground font-mono text-xs">
                        /{project.slug}
                    </p>
                </div>

                <div className="self-start">
                    <MoveButtons
                        name={project.title}
                        canUp={index > 0}
                        canDown={index < total - 1}
                        disabled={!reorderable}
                        onMove={(d) => moveProjectAction(project.id, d)}
                    />
                </div>
            </div>

            <div className="border-border/60 bg-background/30 flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2">
                <div className="flex flex-wrap items-center gap-1">
                    <RowAction
                        label={
                            project.isFeatured
                                ? "★ Unggulan"
                                : "☆ Jadikan unggulan"
                        }
                        ariaLabel={
                            project.isFeatured
                                ? `Cabut unggulan ${project.title}`
                                : `Jadikan unggulan ${project.title}`
                        }
                        variant={project.isFeatured ? "secondary" : "ghost"}
                        pressed={project.isFeatured}
                        action={() =>
                            setProjectFeaturedAction(
                                project.id,
                                !project.isFeatured,
                            )
                        }
                    />
                    <RowAction
                        label={published ? "Tarik ke draft" : "Terbitkan"}
                        ariaLabel={
                            published
                                ? `Tarik ${project.title} ke draft`
                                : `Terbitkan ${project.title}`
                        }
                        action={() =>
                            setProjectStatusAction(
                                project.id,
                                published ? "draft" : "published",
                            )
                        }
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <Link
                        href={`/admin/projects/${project.id}`}
                        aria-label={`Ubah ${project.title}`}
                        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2"
                    >
                        Ubah
                    </Link>
                    <ConfirmDelete
                        name={project.title}
                        description="Proyek beserta daftar teknologi dan galerinya dihapus. File gambarnya tetap ada di perpustakaan Media."
                        action={() => deleteProjectAction(project.id)}
                    />
                </div>
            </div>
        </li>
    );
}

export function ProjectsManager({ projects }: { projects: ProjectListRow[] }) {
    const [filter, setFilter] = useState<Filter>("all");

    const publishedCount = projects.filter(
        (p) => p.status === "published",
    ).length;
    const filters: { value: Filter; label: string; count: number }[] = [
        { value: "all", label: "Semua", count: projects.length },
        { value: "published", label: "Terbit", count: publishedCount },
        {
            value: "draft",
            label: "Draft",
            count: projects.length - publishedCount,
        },
    ];

    const visible = projects.filter(
        (p) => filter === "all" || p.status === filter,
    );

    return (
        <div className="space-y-4">
            <div
                role="group"
                aria-label="Filter status"
                className="flex flex-wrap gap-2"
            >
                {filters.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        aria-pressed={filter === f.value}
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            "rounded-full border px-4 py-1.5 text-sm transition-colors",
                            filter === f.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
                        )}
                    >
                        {f.label} <span className="opacity-70">{f.count}</span>
                    </button>
                ))}
            </div>

            {filter !== "all" && (
                <p className="text-muted-foreground text-sm">
                    Urutan hanya bisa diubah di tab Semua.
                </p>
            )}

            {visible.length === 0 ? (
                <p className="text-muted-foreground">
                    {projects.length === 0
                        ? "Belum ada proyek."
                        : "Tidak ada proyek di tab ini."}
                </p>
            ) : (
                <ul className="space-y-3">
                    {visible.map((project, index) => (
                        <ProjectRow
                            key={project.id}
                            project={project}
                            index={index}
                            total={visible.length}
                            reorderable={filter === "all"}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}
