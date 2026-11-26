import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { achievements, certificates, media } from "@/db/schema";

export async function listCertificates() {
    return db
        .select({
            id: certificates.id,
            title: certificates.title,
            issuer: certificates.issuer,
            issuedDate: certificates.issuedDate,
            credentialUrl: certificates.credentialUrl,
            fileMediaId: certificates.fileMediaId,
            fileName: media.originalName,
            isVisible: certificates.isVisible,
        })
        .from(certificates)
        .leftJoin(media, eq(media.id, certificates.fileMediaId))
        .orderBy(
            asc(certificates.sortOrder),
            desc(certificates.issuedDate),
            asc(certificates.id),
        );
}

export async function listAchievements() {
    return db
        .select({
            id: achievements.id,
            title: achievements.title,
            organizer: achievements.organizer,
            level: achievements.level,
            achievedDate: achievements.achievedDate,
            description: achievements.description,
            proofUrl: achievements.proofUrl,
            isVisible: achievements.isVisible,
        })
        .from(achievements)
        .orderBy(
            asc(achievements.sortOrder),
            desc(achievements.achievedDate),
            asc(achievements.id),
        );
}

export type CertificateRow = Awaited<
    ReturnType<typeof listCertificates>
>[number];
export type AchievementRow = Awaited<
    ReturnType<typeof listAchievements>
>[number];
