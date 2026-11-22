import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { education, experiences } from "@/db/schema";

export async function listExperiences() {
    return db
        .select({
            id: experiences.id,
            kind: experiences.kind,
            organization: experiences.organization,
            roleTitle: experiences.roleTitle,
            location: experiences.location,
            startDate: experiences.startDate,
            endDate: experiences.endDate,
            descriptionMd: experiences.descriptionMd,
            url: experiences.url,
            isVisible: experiences.isVisible,
        })
        .from(experiences)
        .orderBy(
            asc(experiences.sortOrder),
            desc(experiences.startDate),
            asc(experiences.id),
        );
}

export async function listEducation() {
    return db
        .select({
            id: education.id,
            institution: education.institution,
            degree: education.degree,
            field: education.field,
            startYear: education.startYear,
            endYear: education.endYear,
            descriptionMd: education.descriptionMd,
            isVisible: education.isVisible,
        })
        .from(education)
        .orderBy(
            asc(education.sortOrder),
            desc(education.startYear),
            asc(education.id),
        );
}

export type ExperienceRow = Awaited<ReturnType<typeof listExperiences>>[number];
export type EducationRow = Awaited<ReturnType<typeof listEducation>>[number];
