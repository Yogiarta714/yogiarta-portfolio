/** Slug URL dari nama teknologi. "C++" jadi "cplusplus", "C#" jadi "csharp", "Next.js" jadi "nextjs". */
export function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\+/g, "plus")
        .replace(/#/g, "sharp")
        .replace(/&/g, "and")
        .replace(/\./g, "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
