import "server-only";
import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { media, profile, socialLinks } from "@/db/schema";

/** Profil untuk situs publik (null kalau belum pernah disimpan) */
export async function getSiteProfile() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    const avatar = alias(media, "avatar");
    const cv = alias(media, "cv");
    const og = alias(media, "og");

    const [row] = await db
        .select({
            fullName: profile.fullName,
            shortName: profile.shortName,
            availabilityText: profile.availabilityText,
            heroTitle: profile.heroTitle,
            heroSummary: profile.heroSummary,
            aboutLead: profile.aboutLead,
            aboutBodyMd: profile.aboutBodyMd,
            university: profile.university,
            location: profile.location,
            publicEmail: profile.publicEmail,
            contactHeading: profile.contactHeading,
            footerText: profile.footerText,
            seoTitle: profile.seoTitle,
            seoDescription: profile.seoDescription,
            avatarUrl: avatar.blobUrl,
            avatarAlt: avatar.altText,
            avatarWidth: avatar.width,
            avatarHeight: avatar.height,
            cvUrl: cv.blobUrl,
            ogImageUrl: og.blobUrl,
        })
        .from(profile)
        .leftJoin(avatar, eq(profile.avatarMediaId, avatar.id))
        .leftJoin(cv, eq(profile.cvMediaId, cv.id))
        .leftJoin(og, eq(profile.ogImageMediaId, og.id))
        .limit(1);

    return row ?? null;
}

/** Tautan sosial yang ditampilkan, sesuai urutan di admin */
export async function getSocialLinks() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    return db
        .select({
            id: socialLinks.id,
            platform: socialLinks.platform,
            label: socialLinks.label,
            url: socialLinks.url,
        })
        .from(socialLinks)
        .where(eq(socialLinks.isVisible, true))
        .orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id));
}

export type SiteProfile = NonNullable<Awaited<ReturnType<typeof getSiteProfile>>>;
export type SocialLinkItem = Awaited<ReturnType<typeof getSocialLinks>>[number];