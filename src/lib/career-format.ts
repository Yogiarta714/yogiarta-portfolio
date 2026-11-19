const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
];

/** "2024-03-15" menjadi "Mar 2024". */
export function formatMonthYear(date: string): string {
    const [year = "", month = ""] = date.split("-");
    const name = MONTHS[Number(month) - 1];
    return name ? `${name} ${year}` : date;
}

/** Periode pengalaman, mis. "Mar 2024 - sekarang". */
export function formatPeriod(start: string, end: string | null): string {
    return `${formatMonthYear(start)} - ${end ? formatMonthYear(end) : "sekarang"}`;
}

/** Rentang tahun pendidikan, mis. "2023 - sekarang" atau "2019 - 2023". */
export function formatYearRange(start: number, end: number | null): string {
    if (end === null) return `${start} - sekarang`;
    return start === end ? String(start) : `${start} - ${end}`;
}
