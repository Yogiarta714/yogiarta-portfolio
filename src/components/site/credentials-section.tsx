import { Container } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, SectionTitle } from "@/components/site/section-heading";
import type {
    getAchievements,
    getCertificates,
} from "@/lib/public-queries/credentials";
import { yearOf } from "@/lib/site-format";

function Row({
    title,
    subtitle,
    note,
    href,
}: {
    title: string;
    subtitle: string;
    note?: string | null;
    href?: string | null;
}) {
    const inner = (
        <>
            <div className="min-w-0">
                <b className="font-heading block text-lg font-semibold tracking-tight">
                    {title}
                </b>
                <span className="text-s-muted text-sm">{subtitle}</span>
                {note && (
                    <p className="text-s-muted mt-1 line-clamp-2 text-sm">
                        {note}
                    </p>
                )}
            </div>
            {href && (
                <span aria-hidden="true" className="text-s-muted mt-0.5">
                    ↗
                </span>
            )}
        </>
    );

    const base =
        "border-s-line flex items-start justify-between gap-4 border-b py-4";

    return href ? (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${base} transition-transform duration-300 hover:translate-x-2`}
        >
            {inner}
        </a>
    ) : (
        <div className={base}>{inner}</div>
    );
}

export function CredentialsSection({
    certificates,
    achievements,
}: {
    certificates: Awaited<ReturnType<typeof getCertificates>>;
    achievements: Awaited<ReturnType<typeof getAchievements>>;
}) {
    if (certificates.length === 0 && achievements.length === 0) return null;

    return (
        <section id="certificates" className="relative py-24">
            <Container>
                <Reveal>
                    <Eyebrow index="04" label="Certificates and achievements" />
                    <SectionTitle>Things I have learned and won.</SectionTitle>
                </Reveal>

                <div className="mt-11 grid gap-11 md:grid-cols-2">
                    {certificates.length > 0 && (
                        <Reveal>
                            <h3 className="text-s-muted mb-1.5 font-mono text-xs font-medium tracking-[0.06em] uppercase">
                                Certificates
                            </h3>
                            {certificates.map((c) => (
                                <Row
                                    key={c.id}
                                    title={c.title}
                                    subtitle={`${c.issuer} · ${yearOf(c.issuedDate)}`}
                                    href={c.credentialUrl ?? c.fileUrl}
                                />
                            ))}
                        </Reveal>
                    )}
                    {achievements.length > 0 && (
                        <Reveal delay={0.1}>
                            <h3 className="text-s-muted mb-1.5 font-mono text-xs font-medium tracking-[0.06em] uppercase">
                                Achievements
                            </h3>
                            {achievements.map((a) => (
                                <Row
                                    key={a.id}
                                    title={a.title}
                                    subtitle={[
                                        a.organizer,
                                        a.level,
                                        yearOf(a.achievedDate),
                                    ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    note={a.description}
                                    href={a.proofUrl}
                                />
                            ))}
                        </Reveal>
                    )}
                </div>
            </Container>
        </section>
    );
}
