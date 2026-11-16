import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { SkillsManager } from "@/components/admin/skills-manager";
import { getSkillsOverview } from "@/lib/admin-queries/skills";

export const metadata: Metadata = { title: "Skills dan teknologi" };

async function SkillsLoader() {
    await connection();
    const { categories, technologies } = await getSkillsOverview();
    return (
        <SkillsManager categories={categories} technologies={technologies} />
    );
}

export default function SkillsPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl">Skills dan teknologi</h1>
                <p className="text-muted-foreground text-sm">
                    Kategori keahlian dan daftar teknologi yang dipakai di situs
                    dan proyek.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={2} />}>
                <SkillsLoader />
            </Suspense>
        </div>
    );
}
