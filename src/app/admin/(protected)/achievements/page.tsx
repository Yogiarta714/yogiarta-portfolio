import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { AchievementManager } from "@/components/admin/achievement-manager";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { listAchievements } from "@/lib/admin-queries/credentials";

export const metadata: Metadata = { title: "Prestasi" };

async function AchievementsLoader() {
    await connection();
    const items = await listAchievements();
    const today = new Date().toISOString().slice(0, 10);
    return <AchievementManager items={items} today={today} />;
}

export default function AchievementsPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Prestasi</h1>
                <p className="text-muted-foreground text-sm">
                    Lomba, beasiswa, dan penghargaan. Yang terbaru di atas.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={2} />}>
                <AchievementsLoader />
            </Suspense>
        </div>
    );
}
