import { Logo } from "@/components/site/logo";
import { getSiteProfile } from "@/lib/public-queries/profile";

export async function SiteFooter() {
    const profile = await getSiteProfile();
    const name = profile?.fullName ?? "Yogi Winata";
    const text = profile?.footerText?.trim() || `© ${name}`;

    return (
        <footer className="border-s-line text-s-muted border-t py-6 text-sm">
            <div className="mx-auto flex max-w-340 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 md:px-12">
                <span className="flex items-center gap-2.5">
                    <Logo className="size-5" />
                    {text}
                </span>
                <span>Built with Next.js, Neon, and Vercel</span>
            </div>
        </footer>
    );
}
