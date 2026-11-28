const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const DASH = "\u2013";

function parse(date: string): { y: number; m: number } | null {
    const match = /^(\d{4})-(\d{2})/.exec(date);
    if (!match) return null;
    const m = Number(match[2]);
    if (m < 1 || m > 12) return null;
    return { y: Number(match[1]), m };
}

/** "2025-03-10" -> "Mar 2025". Dibaca dari teks, bukan Date, supaya tidak terpengaruh zona waktu. */
export function formatMonthYearEn(date: string): string {
    const p = parse(date);
    return p ? `${MONTHS[p.m - 1]} ${p.y}` : date;
}

/** "Mar 2024 - Aug 2025", atau "Mar 2025 - Present" bila belum selesai. */
export function formatPeriodEn(start: string, end: string | null): string {
    const s = formatMonthYearEn(start);
    if (!end) return `${s} ${DASH} Present`;
    const e = formatMonthYearEn(end);
    return s === e ? s : `${s} ${DASH} ${e}`;
}

/** "2020 - 2023", "2023 - Present", atau satu tahun saja bila sama. */
export function formatYearRangeEn(
    startYear: number,
    endYear: number | null,
): string {
    if (endYear === null) return `${startYear} ${DASH} Present`;
    return startYear === endYear
        ? String(startYear)
        : `${startYear} ${DASH} ${endYear}`;
}

export function yearOf(date: string): string {
    return date.slice(0, 4);
}

/** Inisial untuk gambar cadangan proyek: "House Price Prediction" -> "HP". */
export function initialsOf(title: string): string {
    const words = title.trim().split(/\s+/).filter(Boolean);
    const letters = words.slice(0, 2).map((w) => Array.from(w)[0] ?? "");
    return letters.join("").toUpperCase();
}
