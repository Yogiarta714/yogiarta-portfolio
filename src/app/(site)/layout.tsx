import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { getSiteProfile } from "@/lib/public-queries/profile";

export default async function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getSiteProfile();

    return (
        <div
            lang="en"
            className="site bg-s-bg text-s-fg flex min-h-dvh flex-col font-sans"
        >
            <SiteNav brand={profile?.shortName || "Yogi Winata"} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </div>
    );
}
