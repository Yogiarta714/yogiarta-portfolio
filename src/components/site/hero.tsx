import { Fragment, type CSSProperties } from "react";
import { siteButton } from "@/components/site/button-styles";
import { Container } from "@/components/site/container";
import { parseHeroTitle, stripHeroMarkers } from "@/lib/hero-title";
import type { SiteProfile, SocialLinkItem } from "@/lib/public-queries/profile";

const delay = (seconds: number) =>
    ({ "--delay": `${seconds}s` }) as CSSProperties;

function Chip({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className: string;
}) {
    return (
        <div
            className={`s-float border-s-line bg-s-nav absolute flex flex-col gap-0.5 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${className}`}
        >
            <small className="text-s-muted font-mono text-[11px]">
                {label}
            </small>
            <b className="font-heading text-[15px] font-semibold">{value}</b>
        </div>
    );
}

export function Hero({
    profile,
    socials,
}: {
    profile: SiteProfile;
    socials: SocialLinkItem[];
}) {
    const tokens = parseHeroTitle(profile.heroTitle);

    return (
        <section
            id="hero"
            className="relative flex min-h-svh items-center overflow-hidden pt-32 pb-16"
        >
            <div className="hero-glow" aria-hidden="true" />
            <div className="hero-grid" aria-hidden="true" />

            <Container className="relative z-10 grid items-center gap-11 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
                <div>
                    {profile.availabilityText && (
                        <span
                            className="fade-up border-s-line bg-s-surface text-s-muted inline-flex items-center gap-2.5 rounded-full border py-1.5 pr-3.5 pl-3 font-mono text-[12.5px]"
                            style={delay(0)}
                        >
                            <span className="s-dot bg-s-pop relative size-2 rounded-full" />
                            {profile.availabilityText}
                        </span>
                    )}

                    <p className="text-s-accent mt-6 font-mono text-sm tracking-[0.04em]">
                        Hi, I&apos;m {profile.shortName}
                    </p>

                    <h1
                        aria-label={stripHeroMarkers(profile.heroTitle)}
                        className="font-heading mt-3.5 text-[clamp(38px,5.6vw,88px)] leading-[1.02] font-bold tracking-[-0.035em] text-balance"
                    >
                        {tokens.map((token, i) => (
                            <Fragment key={`${token.text}-${i}`}>
                                {i > 0 && !token.glue ? " " : null}
                                <span
                                    aria-hidden="true"
                                    className={`hero-word ${token.kind === "grad" ? "hero-grad" : ""}`}
                                    style={{ "--i": i } as CSSProperties}
                                >
                                    {token.kind === "ul" ? (
                                        <span className="hero-ul">
                                            {token.text}
                                        </span>
                                    ) : (
                                        token.text
                                    )}
                                </span>
                            </Fragment>
                        ))}
                    </h1>

                    <p
                        className="fade-up text-s-muted mt-6 max-w-135 text-lg"
                        style={delay(1.15)}
                    >
                        {profile.heroSummary}
                    </p>

                    <div
                        className="fade-up mt-8 flex flex-wrap gap-3"
                        style={delay(1.3)}
                    >
                        <a href="#projects" className={siteButton.primary}>
                            View projects <span aria-hidden="true">↓</span>
                        </a>
                        {profile.cvUrl && (
                            <a
                                href={profile.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={siteButton.secondary}
                            >
                                Download CV
                                <span className="text-s-muted font-mono text-[11px]">
                                    PDF
                                </span>
                            </a>
                        )}
                    </div>

                    {socials.length > 0 && (
                        <div
                            className="fade-up text-s-muted mt-6 flex flex-wrap gap-x-5 gap-y-1.5 text-[14.5px]"
                            style={delay(1.45)}
                        >
                            {socials.slice(0, 3).map((s) => {
                                const external = s.url.startsWith("http");
                                return (
                                    <a
                                        key={s.id}
                                        href={s.url}
                                        className="s-link"
                                        {...(external
                                            ? {
                                                  target: "_blank",
                                                  rel: "noopener noreferrer",
                                              }
                                            : {})}
                                    >
                                        {s.label}
                                        {external ? " ↗" : ""}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div
                    className="fade-up relative mx-auto w-full max-w-95"
                    style={delay(0.7)}
                >
                    <div className="s-stripes border-s-line relative aspect-4/5 overflow-hidden rounded-[26px] border">
                        {profile.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatarUrl}
                                alt={profile.avatarAlt ?? profile.fullName}
                                width={profile.avatarWidth ?? undefined}
                                height={profile.avatarHeight ?? undefined}
                                fetchPriority="high"
                                decoding="async"
                                className="absolute inset-0 size-full object-cover"
                            />
                        ) : (
                            <span className="text-s-muted absolute top-3.5 left-4 font-mono text-xs">
                                profile photo
                            </span>
                        )}
                        <div className="s-photo-tint pointer-events-none absolute inset-0" />
                    </div>
                    {profile.university && (
                        <Chip
                            label="University"
                            value={profile.university}
                            className="top-[46%] -right-2 sm:-right-5.5"
                        />
                    )}
                    {profile.location && (
                        <Chip
                            label="Location"
                            value={profile.location}
                            className="-bottom-5 left-[10%]"
                        />
                    )}
                </div>
            </Container>
        </section>
    );
}
