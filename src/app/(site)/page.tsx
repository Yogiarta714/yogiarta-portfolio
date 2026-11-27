import { getSiteProfile, getSocialLinks } from "@/lib/public-queries/profile";

// Halaman sementara. Diganti hero dan semua bagian di langkah 7b.
export default async function HomePage() {
    const [profile, socials] = await Promise.all([
        getSiteProfile(),
        getSocialLinks(),
    ]);

    return (
        <div className="mx-auto max-w-3xl px-5 pt-40 pb-24">
            {profile ? (
                <>
                    <p className="text-s-accent font-mono text-sm">
                        {profile.availabilityText ?? "No availability text"}
                    </p>
                    <h1 className="font-heading mt-4 text-5xl leading-tight font-bold tracking-tight">
                        {profile.heroTitle}
                    </h1>
                    <p className="text-s-muted mt-5 text-lg">
                        {profile.heroSummary}
                    </p>
                    <ul className="mt-8 flex flex-wrap gap-4 text-sm">
                        {socials.map((s) => (
                            <li key={s.id}>
                                <a className="underline" href={s.url}>
                                    {s.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="text-s-muted">
                    Profile has not been set up yet. Fill it in at
                    /admin/profile.
                </p>
            )}
        </div>
    );
}
