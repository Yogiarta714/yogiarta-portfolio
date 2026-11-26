import { asc } from "drizzle-orm";
import { db } from "@/db";
import { socialLinks } from "@/db/schema";

export async function listSocialLinks() {
    return db
        .select({
            id: socialLinks.id,
            platform: socialLinks.platform,
            label: socialLinks.label,
            url: socialLinks.url,
            isVisible: socialLinks.isVisible,
        })
        .from(socialLinks)
        .orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id));
}

export type SocialLinkRow = Awaited<ReturnType<typeof listSocialLinks>>[number];
