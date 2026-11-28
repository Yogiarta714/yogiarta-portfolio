export type TitleToken = {
    text: string;
    /** plain: teks biasa, grad: gradasi oranye, ul: garis bawah cyan */
    kind: "plain" | "grad" | "ul";
    /** true bila token menempel pada token sebelumnya (tanpa spasi), misalnya koma */
    glue: boolean;
};

const MARKER = /\[\[(.+?)\]\]|\{\{(.+?)\}\}/g;

/**
 * Mengubah judul hero menjadi token kata.
 *   [[teks]] -> gradasi, per kata
 *   {{teks}} -> garis bawah, satu kesatuan
 * Penanda yang tidak lengkap dibiarkan sebagai teks biasa
 */
export function parseHeroTitle(input: string): TitleToken[] {
    const tokens: TitleToken[] = [];
    let pendingSpace = false;

    const pushPlain = (chunk: string) => {
        for (const part of chunk.match(/\S+|\s+/g) ?? []) {
            if (/^\s+$/.test(part)) {
                pendingSpace = true;
                continue;
            }
            tokens.push({
                text: part,
                kind: "plain",
                glue: tokens.length > 0 && !pendingSpace,
            });
            pendingSpace = false;
        }
    };

    let last = 0;
    for (const match of input.matchAll(MARKER)) {
        const start = match.index ?? 0;
        pushPlain(input.slice(last, start));
        last = start + match[0].length;

        if (match[1] !== undefined) {
            const words = match[1].trim().split(/\s+/).filter(Boolean);
            words.forEach((word, i) => {
                tokens.push({
                    text: word,
                    kind: "grad",
                    glue: i === 0 ? tokens.length > 0 && !pendingSpace : false,
                });
            });
            pendingSpace = false;
        } else if (match[2] !== undefined) {
            const text = match[2].trim();
            if (text) {
                tokens.push({
                    text,
                    kind: "ul",
                    glue: tokens.length > 0 && !pendingSpace,
                });
                pendingSpace = false;
            }
        }
    }
    pushPlain(input.slice(last));
    return tokens;
}

/** Teks polos tanpa penanda, untuk aria-label dan metadata. */
export function stripHeroMarkers(input: string): string {
    return input
        .replace(
            MARKER,
            (_m, a: string | undefined, b: string | undefined) => a ?? b ?? "",
        )
        .replace(/\s+/g, " ")
        .trim();
}
