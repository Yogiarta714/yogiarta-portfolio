import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { SocialLinkManager } from "@/components/admin/social-link-manager";
import { listSocialLinks } from "@/lib/admin-queries/social-links";

export const metadata: Metadata = { title: "Tautan sosial" };

async function SocialLinksLoader() {
    await connection();
    const items = await listSocialLinks();
    return <SocialLinkManager items={items} />;
}

export default function SocialLinksPage() {
    return (
        <div className="max-w-5xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Tautan sosial</h1>
                <p className="text-muted-foreground text-sm">
                    GitHub, LinkedIn, Instagram, dan email yang tampil di situs.
                </p>
            </div>
            <Suspense fallback={<FormSkeleton sections={1} />}>
                <SocialLinksLoader />
            </Suspense>
        </div>
    );
}
