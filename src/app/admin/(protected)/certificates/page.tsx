import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CertificateManager } from "@/components/admin/certificate-manager";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { listCertificates } from "@/lib/admin-queries/credentials";
import { listMedia } from "@/lib/admin-queries/media";

export const metadata: Metadata = { title: "Sertifikat" };

async function CertificatesLoader() {
    await connection();
    const [items, library] = await Promise.all([
        listCertificates(),
        listMedia(),
    ]);
    const today = new Date().toISOString().slice(0, 10);
    return <CertificateManager items={items} library={library} today={today} />;
}

export default function CertificatesPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Sertifikat</h1>
                <p className="text-muted-foreground text-sm">
                    Sertifikat kursus dan pelatihan, dengan file atau tautan
                    verifikasi.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={2} />}>
                <CertificatesLoader />
            </Suspense>
        </div>
    );
}
