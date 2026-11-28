import { AboutSection } from "@/components/site/about-section";
import { ContactSection } from "@/components/site/contact-section";
import { Container } from "@/components/site/container";
import { CredentialsSection } from "@/components/site/credentials-section";
import { ExperienceSection } from "@/components/site/experience-section";
import { Hero } from "@/components/site/hero";
import { ProjectsSection } from "@/components/site/projects-section";
import { TechMarquee } from "@/components/site/tech-marquee";
import { getEducation, getExperiences } from "@/lib/public-queries/career";
import {
    getAchievements,
    getCertificates,
} from "@/lib/public-queries/credentials";
import { getSiteProfile, getSocialLinks } from "@/lib/public-queries/profile";
import { getHomeProjects } from "@/lib/public-queries/projects";
import { getSkillGroups } from "@/lib/public-queries/skills";

export default async function HomePage() {
    const [
        profile,
        socials,
        skills,
        projects,
        experiences,
        education,
        certificates,
        achievements,
    ] = await Promise.all([
        getSiteProfile(),
        getSocialLinks(),
        getSkillGroups(),
        getHomeProjects(),
        getExperiences(),
        getEducation(),
        getCertificates(),
        getAchievements(),
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
            <ProjectsSection
                featured={projects.featured}
                more={projects.more}
                total={projects.total}
            />
            <ExperienceSection
                experiences={experiences}
                education={education}
            />
            <CredentialsSection
                certificates={certificates}
                achievements={achievements}
            />
            <ContactSection profile={profile} socials={socials} />
        </>
    );
}
