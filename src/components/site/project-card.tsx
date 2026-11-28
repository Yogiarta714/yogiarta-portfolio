import Link from "next/link";
import type { HomeProject } from "@/lib/public-queries/projects";
import { initialsOf } from "@/lib/site-format";

export function ProjectCard({
    project,
    wide,
}: {
    project: HomeProject;
    wide: boolean;
}) {
    const href = `/projects/${project.slug}`;

    return (
        <article
            className={`group border-s-line bg-s-surface hover:border-s-pop/60 relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border p-5.5 transition-all duration-500 hover:-translate-y-1.5 ${
                wide ? "md:flex-row md:gap-9 md:p-6.5" : ""
            }`}
        >
            <div
                className={`border-s-line bg-s-surface2 aspect-16/10 min-w-0 overflow-hidden rounded-2xl border ${
                    wide ? "md:flex-[1_1_52%]" : ""
                }`}
            >
                {project.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={project.thumbUrl}
                        alt={project.thumbAlt ?? project.title}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="s-mono-fallback size-full"
                    >
                        {initialsOf(project.title)}
                    </div>
                )}
            </div>

            <div
                className={`flex min-w-0 flex-col gap-3.5 ${wide ? "md:flex-[1_1_44%] md:justify-center" : ""}`}
            >
                <div className="text-s-muted flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-xs">
                    <span className="bg-s-accent text-s-on-accent rounded-full px-2.5 py-0.5 text-[11px]">
                        Featured
                    </span>
                    <span>
                        {project.category} · {project.year}
                    </span>
                </div>

                <h3
                    className={`font-heading leading-[1.1] font-bold tracking-tight ${
                        wide ? "text-[clamp(26px,3.4vw,36px)]" : "text-[23px]"
                    }`}
                >
                    <Link
                        href={href}
                        className="after:absolute after:inset-0 after:rounded-3xl"
                    >
                        {project.title}
                    </Link>
                </h3>

                <p className="text-s-muted text-[15.5px]">{project.summary}</p>

                {project.techs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {project.techs.slice(0, 6).map((tech) => (
                            <span
                                key={tech}
                                className="border-s-line text-s-muted rounded-full border px-2.5 py-1 font-mono text-xs"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {wide && (
                    <div className="mt-1 flex flex-wrap gap-x-4.5 gap-y-1 text-[14.5px] font-semibold">
                        <Link href={href} className="s-link relative z-10">
                            Case study ↗
                        </Link>
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="s-link relative z-10"
                            >
                                GitHub ↗
                            </a>
                        )}
                        {project.demoUrl && (
                            <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="s-link relative z-10"
                            >
                                Live demo ↗
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}
