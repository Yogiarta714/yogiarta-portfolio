import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { skillCategories, technologies } from "@/db/schema";

/** Skill per kategori untuk bagian About, dan daftar datar untuk pita teknologi */
export async function getSkillGroups() {
    "use cache";
    cacheLife("hours");
    cacheTag("site");

    const [rows, categories] = await Promise.all([
        db
            .select({
                name: technologies.name,
                categoryId: technologies.categoryId,
            })
            .from(technologies)
            .where(eq(technologies.showInSkills, true))
            .orderBy(asc(technologies.sortOrder), asc(technologies.name)),
        db
            .select({ id: skillCategories.id, name: skillCategories.name })
            .from(skillCategories)
            .orderBy(asc(skillCategories.sortOrder), asc(skillCategories.name)),
    ]);

    const groups = categories
        .map((c) => ({
            id: c.id,
            name: c.name,
            items: rows.filter((r) => r.categoryId === c.id).map((r) => r.name),
        }))
        .filter((g) => g.items.length > 0);

    const uncategorized = rows
        .filter((r) => r.categoryId === null)
        .map((r) => r.name);
    if (uncategorized.length > 0) {
        groups.push({ id: "other", name: "Other", items: uncategorized });
    }

    return { groups, all: rows.map((r) => r.name) };
}
