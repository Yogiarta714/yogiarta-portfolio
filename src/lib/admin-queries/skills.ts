import "server-only";
import { asc, count } from "drizzle-orm";
import { db } from "@/db";
import {
    projectTechnologies,
    skillCategories,
    technologies,
} from "@/db/schema";

export type CategoryRow = {
    id: string;
    name: string;
    sortOrder: number;
};

export type TechnologyRow = {
    id: string;
    name: string;
    slug: string;
    categoryId: string | null;
    showInSkills: boolean;
    sortOrder: number;
    projectCount: number;
};

export async function getSkillsOverview(): Promise<{
    categories: CategoryRow[];
    technologies: TechnologyRow[];
}> {
    const [categories, techs, counts] = await Promise.all([
        db
            .select({
                id: skillCategories.id,
                name: skillCategories.name,
                sortOrder: skillCategories.sortOrder,
            })
            .from(skillCategories)
            .orderBy(asc(skillCategories.sortOrder), asc(skillCategories.name)),

        db
            .select({
                id: technologies.id,
                name: technologies.name,
                slug: technologies.slug,
                categoryId: technologies.categoryId,
                showInSkills: technologies.showInSkills,
                sortOrder: technologies.sortOrder,
            })
            .from(technologies)
            .orderBy(asc(technologies.sortOrder), asc(technologies.name)),

        db
            .select({
                technologyId: projectTechnologies.technologyId,
                total: count(),
            })
            .from(projectTechnologies)
            .groupBy(projectTechnologies.technologyId),
    ]);

    const usage = new Map(counts.map((row) => [row.technologyId, row.total]));
    return {
        categories,
        technologies: techs.map((t) => ({
            ...t,
            projectCount: usage.get(t.id) ?? 0,
        })),
    };
}
