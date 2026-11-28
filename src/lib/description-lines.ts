/**
 * Memecah deskripsi singkat menjadi kalimat pengantar dan poin.
 * Baris berawalan "- ", "* ", atau "\u2022 " menjadi poin; baris lain menjadi pengantar.
 */
export function parseDescription(text: string | null): {
    intro: string[];
    bullets: string[];
} {
    const intro: string[] = [];
    const bullets: string[] = [];
    for (const raw of (text ?? "").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || /^[-*\u2022]$/.test(line)) continue;
        const match = /^[-*\u2022]\s+(.*)$/.exec(line);
        if (match) {
            if (match[1]) bullets.push(match[1]);
        } else {
            intro.push(line);
        }
    }
    return { intro, bullets };
}
