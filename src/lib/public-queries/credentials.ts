import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { achievements, certificates, media } from "@/db/schema";

export async function getCertificates() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    const file = alias(media, "file");
    return db
        .select({
            id: certificates.id,
            title: certificates.title,
            issuer: certificates.issuer,
            issuedDate: certificates.issuedDate,
            credentialUrl: certificates.credentialUrl,
            fileUrl: file.blobUrl,
        })
        .from(certificates)
        .leftJoin(file, eq(certificates.fileMediaId, file.id))
        .where(eq(certificates.isVisible, true))
        .orderBy(
            asc(certificates.sortOrder),
            desc(certificates.issuedDate),
            asc(certificates.id),
        );
}

export async function getAchievements() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    return db
        .select({
            id: achievements.id,
            title: achievements.title,
            organizer: achievements.organizer,
            level: achievements.level,
            achievedDate: achievements.achievedDate,
            description: achievements.description,
            proofUrl: achievements.proofUrl,
        })
        .from(achievements)
        .where(eq(achievements.isVisible, true))
        .orderBy(
            asc(achievements.sortOrder),
            desc(achievements.achievedDate),
            asc(achievements.id),
        );
}
