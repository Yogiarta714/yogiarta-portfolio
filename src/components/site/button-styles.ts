const base =
    "inline-flex items-center gap-2.5 rounded-full border px-[22px] py-3.5 text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5";

export const siteButton = {
    primary: `${base} bg-s-accent text-s-on-accent border-transparent hover:shadow-[0_12px_28px_-10px_var(--s-accent)]`,
    secondary: `${base} border-s-line bg-s-surface text-s-fg hover:border-s-pop`,
};
