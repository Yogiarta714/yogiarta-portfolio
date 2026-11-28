import { Container } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow, SectionTitle } from "@/components/site/section-heading";
import type { SiteProfile } from "@/lib/public-queries/profile";

type Group = { id: string; name: string; items: string[] };

export function AboutSection({
    profile,
    groups,
}: {
    profile: SiteProfile;
    groups: Group[];
}) {
    const paragraphs = profile.aboutBodyMd
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);

    if (!profile.aboutLead && paragraphs.length === 0 && groups.length === 0) {
        return null;
    }

    return (
        <section id="about" className="relative py-24">
            <Container>
                <Reveal>
                    <Eyebrow index="01" label="About" />
                    {profile.aboutLead && (
                        <SectionTitle>{profile.aboutLead}</SectionTitle>
                    )}
                </Reveal>

                <div className="mt-11 grid gap-9 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
                    <Reveal
                        delay={0.1}
                        className="text-s-muted space-y-4 text-[17px]"
                    >
                        {paragraphs.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </Reveal>

                    {groups.length > 0 && (
                        <Reveal
                            delay={0.2}
                            className="grid grid-cols-1 gap-x-6 gap-y-6 min-[420px]:grid-cols-2"
                        >
                            {groups.map((group) => (
                                <div key={group.id}>
                                    <h3 className="text-s-accent mb-2.5 font-mono text-xs font-medium tracking-[0.06em] uppercase">
                                        {group.name}
                                    </h3>
                                    <ul className="flex flex-col gap-1 text-[15.5px]">
                                        {group.items.map((item) => (
                                            <li
                                                key={item}
                                                className="hover:text-s-pop transition-all duration-300 hover:translate-x-1.5"
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </Reveal>
                    )}
                </div>
            </Container>
        </section>
    );
}
