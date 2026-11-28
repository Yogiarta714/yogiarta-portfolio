import { AboutSection } from "@/components/site/about-section";
import { Container } from "@/components/site/container";
import { Hero } from "@/components/site/hero";
import { TechMarquee } from "@/components/site/tech-marquee";
import { getSiteProfile, getSocialLinks } from "@/lib/public-queries/profile";
import { getSkillGroups } from "@/lib/public-queries/skills";

export default async function HomePage() {
    const [profile, socials, skills] = await Promise.all([
        getSiteProfile(),
        getSocialLinks(),
        getSkillGroups(),
    ]);

    if (!profile) {
        return (
            <Container className="pt-40 pb-24">
                <p className="text-s-muted">
                    Profile has not been set up yet. Fill it in at
                    /admin/profile.
                </p>
            </Container>
        );
    }

    return (
        <>
            <Hero profile={profile} socials={socials} />
            <TechMarquee names={skills.all} />
            <AboutSection profile={profile} groups={skills.groups} />
            {/* 7b-2: proyek, pengalaman, sertifikat, kontak */}
        </>
    );
}
