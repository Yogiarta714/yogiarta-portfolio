import { Container } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, SectionTitle } from "@/components/site/section-heading";
import { TimelineItem } from "@/components/site/timeline-item";
import { Timeline } from "@/components/site/timeline";
import { parseDescription } from "@/lib/description-lines";
import type { getEducation, getExperiences } from "@/lib/public-queries/career";
import { formatPeriodEn, formatYearRangeEn } from "@/lib/site-format";

type Entry = {
    id: string;
    when: string;
    title: string;
    org: string;
    orgUrl?: string | null;
    meta?: string | null;
    description: string | null;
};

function Column({ label, entries }: { label: string; entries: Entry[] }) {
    return (
        <div>
            <Reveal>
                <h3 className="text-s-muted font-mono text-xs font-medium tracking-[0.06em] uppercase">
                    {label}
                </h3>
            </Reveal>
            <Timeline className="s-tl mt-6">
                {entries.map((entry) => {
                    const { intro, bullets } = parseDescription(
                        entry.description,
                    );
                    return (
                        <TimelineItem key={entry.id}>
                            <Reveal>
                                <div className="text-s-accent font-mono text-[13px]">
                                    {entry.when}
                                </div>
                                <h3 className="font-heading mt-1.5 text-2xl font-semibold tracking-[-0.02em]">
                                    {entry.title}
                                </h3>
                                <div className="text-s-muted mt-0.5 text-[15.5px]">
                                    {entry.orgUrl ? (
                                        <a
                                            href={entry.orgUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="s-link"
                                        >
                                            {entry.org}
                                        </a>
                                    ) : (
                                        entry.org
                                    )}
                                    {entry.meta ? ` · ${entry.meta}` : ""}
                                </div>
                                {intro.map((line, i) => (
                                    <p
                                        key={i}
                                        className="text-s-muted mt-3 max-w-160 text-[15.5px]"
                                    >
                                        {line}
                                    </p>
                                ))}
                                {bullets.length > 0 && (
                                    <ul className="s-dash text-s-muted mt-3 flex max-w-160 flex-col gap-1.5 text-[15.5px]">
                                        {bullets.map((b, i) => (
                                            <li key={i}>{b}</li>
                                        ))}
                                    </ul>
                                )}
                            </Reveal>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </div>
    );
}

export function ExperienceSection({
    experiences,
    education,
}: {
    experiences: Awaited<ReturnType<typeof getExperiences>>;
    education: Awaited<ReturnType<typeof getEducation>>;
}) {
    if (experiences.length === 0 && education.length === 0) return null;

    const work: Entry[] = experiences.map((e) => ({
        id: e.id,
        when: formatPeriodEn(e.startDate, e.endDate),
        title: e.roleTitle,
        org: e.organization,
        orgUrl: e.url,
        meta: e.location,
        description: e.descriptionMd,
    }));

    const school: Entry[] = education.map((e) => ({
        id: e.id,
        when: formatYearRangeEn(e.startYear, e.endYear),
        title: `${e.degree} in ${e.field}`,
        org: e.institution,
        description: e.descriptionMd,
    }));

    const both = work.length > 0 && school.length > 0;

    return (
        <section id="experience" className="relative py-24">
            <Container>
                <Reveal>
                    <Eyebrow index="03" label="Experience and education" />
                    <SectionTitle>
                        Where I have learned and worked.
                    </SectionTitle>
                </Reveal>

                <div
                    className={`mt-11 grid gap-12 ${
                        both
                            ? "lg:grid-cols-[1.15fr_0.85fr] lg:gap-14"
                            : "max-w-3xl"
                    }`}
                >
                    {work.length > 0 && (
                        <Column label="Experience" entries={work} />
                    )}
                    {school.length > 0 && (
                        <Column label="Education" entries={school} />
                    )}
                </div>
            </Container>
        </section>
    );
}
