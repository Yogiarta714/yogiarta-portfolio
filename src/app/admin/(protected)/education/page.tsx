import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { EducationManager } from "@/components/admin/education-manager";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { listEducation } from "@/lib/admin-queries/career";

export const metadata: Metadata = { title: "Pendidikan" };

async function EducationLoader() {
    await connection();
    const items = await listEducation();
    const today = new Date().toISOString().slice(0, 10);
    return <EducationManager items={items} today={today} />;
}

export default function EducationPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Pendidikan</h1>
                <p className="text-muted-foreground text-sm">
                    Riwayat pendidikan formal. Yang terbaru di atas.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={2} />}>
                <EducationLoader />
            </Suspense>
        </div>
    );
}
