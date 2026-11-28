import { Container } from "@/components/site/container";
import { CopyEmail } from "@/components/site/copy-email";
import { MarkedText } from "@/components/site/marked-text";
import { Reveal } from "@/components/site/reveal";
import { Eyebrow } from "@/components/site/section-heading";
import type { SiteProfile, SocialLinkItem } from "@/lib/public-queries/profile";

const DEFAULT_HEADING =
    "Have an idea, a project, or an internship offer? [[Let's talk.]]";

export function ContactSection({
    profile,
    socials,
}: {
    profile: SiteProfile;
    socials: SocialLinkItem[];
}) {
    const heading = profile.contactHeading?.trim() || DEFAULT_HEADING;
    const links = socials.filter((s) => s.url.startsWith("http"));

    return (
        <section id="contact" className="relative pt-28 pb-16 text-center">
            <Container>
                <Reveal>
                    <div className="flex justify-center">
                        <Eyebrow index="05" label="Contact" plain />
                    </div>
                </Reveal>

                <Reveal delay={0.08}>
                    <h2 className="font-heading mx-auto mt-5 max-w-225 text-[clamp(34px,6.2vw,78px)] leading-[1.02] font-bold tracking-[-0.04em] text-balance">
                        <MarkedText text={heading} />
                    </h2>
                </Reveal>

                <Reveal delay={0.16} className="mt-9">
                    {profile.publicEmail && (
                        <CopyEmail email={profile.publicEmail} />
                    )}
                    {links.length > 0 && (
                        <div className="text-s-muted mt-7 flex flex-wrap justify-center gap-x-6 gap-y-1.5">
                            {links.map((s) => (
                                <a
                                    key={s.id}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="s-link"
                                >
                                    {s.label} ↗
                                </a>
                            ))}
                        </div>
                    )}
                </Reveal>
            </Container>
        </section>
    );
}
