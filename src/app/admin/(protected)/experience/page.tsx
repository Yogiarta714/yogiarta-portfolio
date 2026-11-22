import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ExperienceManager } from "@/components/admin/experience-manager";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { listExperiences } from "@/lib/admin-queries/career";

export const metadata: Metadata = { title: "Pengalaman" };

async function ExperienceLoader() {
    await connection();
    const items = await listExperiences();
    const today = new Date().toISOString().slice(0, 10);
    return <ExperienceManager items={items} today={today} />;
}

export default function ExperiencePage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Pengalaman</h1>
                <p className="text-muted-foreground text-sm">
                    Pekerjaan, organisasi, dan kegiatan relawan. Yang terbaru di
                    atas.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={2} />}>
                <ExperienceLoader />
            </Suspense>
        </div>
    );
}
