import "server-only";
import { count, eq, type SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
    achievements,
    certificates,
    education,
    experiences,
    profile,
    projects,
    socialLinks,
    technologies,
} from "@/db/schema";
import type { DashboardSummary } from "@/lib/dashboard-attention";

async function countRows(table: PgTable, where?: SQL) {
    const [row] = await db.select({ total: count() }).from(table).where(where);
    return row?.total ?? 0;
}

// Hanya boleh dipanggil setelah requireAdmin()
export async function getDashboardSummary(): Promise<DashboardSummary> {
    const [
        draftProjects,
        publishedProjects,
        techCount,
        experienceCount,
        educationCount,
        certificateCount,
        achievementCount,
        socialLinkCount,
        profileRows,
    ] = await Promise.all([
        countRows(projects, eq(projects.status, "draft")),
        countRows(projects, eq(projects.status, "published")),
        countRows(technologies),
        countRows(experiences),
        countRows(education),
        countRows(certificates),
        countRows(achievements),
        countRows(socialLinks),
        db
            .select({
                avatar: profile.avatarMediaId,
                cv: profile.cvMediaId,
            })
            .from(profile)
            .limit(1),
    ]);

    const profileRow = profileRows[0];

    return {
        hasProfile: Boolean(profileRow),
        hasAvatar: Boolean(profileRow?.avatar),
        hasCv: Boolean(profileRow?.cv),
        draftProjects,
        publishedProjects,
        technologies: techCount,
        experiences: experienceCount,
        education: educationCount,
        certificates: certificateCount,
        achievements: achievementCount,
        socialLinks: socialLinkCount,
    };
}
