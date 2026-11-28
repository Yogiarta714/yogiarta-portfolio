import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { education, experiences } from "@/db/schema";

export async function getExperiences() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    return db
        .select({
            id: experiences.id,
            organization: experiences.organization,
            roleTitle: experiences.roleTitle,
            location: experiences.location,
            startDate: experiences.startDate,
            endDate: experiences.endDate,
            descriptionMd: experiences.descriptionMd,
            url: experiences.url,
        })
        .from(experiences)
        .where(eq(experiences.isVisible, true))
        .orderBy(
            asc(experiences.sortOrder),
            desc(experiences.startDate),
            asc(experiences.id),
        );
}

export async function getEducation() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    return db
        .select({
            id: education.id,
            institution: education.institution,
            degree: education.degree,
            field: education.field,
            startYear: education.startYear,
            endYear: education.endYear,
            descriptionMd: education.descriptionMd,
        })
        .from(education)
        .where(eq(education.isVisible, true))
        .orderBy(
            asc(education.sortOrder),
            desc(education.startYear),
            asc(education.id),
        );
}
