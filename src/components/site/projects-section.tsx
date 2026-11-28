import Link from "next/link";
import { siteButton } from "@/components/site/button-styles";
import { Container } from "@/components/site/container";
import { ProjectCard } from "@/components/site/project-card";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, SectionTitle } from "@/components/site/section-heading";
import type { HomeProject } from "@/lib/public-queries/projects";

export function ProjectsSection({
    featured,
    more,
    total,
}: {
    featured: HomeProject[];
    more: HomeProject[];
    total: number;
}) {
    if (total === 0) return null;

    return (
        <section id="projects" className="relative py-24">
            <Container>
                <Reveal>
                    <Eyebrow index="02" label="Projects" />
                    <SectionTitle>A few things I have built.</SectionTitle>
                </Reveal>

                {featured.length > 0 && (
                    <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-6">
                        {featured.map((project, i) => {
                            const wide = i === 0 || featured.length === 2;
                            return (
                                <Reveal
                                    key={project.id}
                                    delay={i * 0.08}
                                    className={
                                        wide ? "md:col-span-6" : "md:col-span-3"
                                    }
                                >
                                    <ProjectCard
                                        project={project}
                                        wide={wide}
                                    />
                                </Reveal>
                            );
                        })}
                    </div>
                )}

                {more.length > 0 && (
                    <Reveal className="mt-11">
                        <h3 className="text-s-muted mb-1.5 font-mono text-xs font-medium tracking-[0.06em] uppercase">
                            More projects
                        </h3>
                        {more.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.slug}`}
                                className="s-row grid grid-cols-[52px_minmax(0,1fr)_20px] items-center gap-4 px-1 py-4.5 sm:grid-cols-[70px_minmax(0,1fr)_minmax(0,0.8fr)_24px]"
                            >
                                <span className="text-s-muted font-mono text-[13px]">
                                    {project.year}
                                </span>
                                <span className="font-heading text-xl font-semibold tracking-[-0.015em]">
                                    {project.title}
                                </span>
                                <span className="text-s-muted hidden text-sm sm:block">
                                    {project.techs.join(", ")}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-s-muted"
                                >
                                    ↗
                                </span>
                            </Link>
                        ))}
                    </Reveal>
                )}

                {total > featured.length && (
                    <Reveal className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                        <Link href="/projects" className={siteButton.primary}>
                            View all projects <span aria-hidden="true">→</span>
                        </Link>
                        <span className="text-s-muted text-[14.5px]">
                            {total} {total === 1 ? "project" : "projects"} in
                            total
                        </span>
                    </Reveal>
                )}
            </Container>
        </section>
    );
}
