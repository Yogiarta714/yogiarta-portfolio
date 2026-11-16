export type Direction = "up" | "down";

/**
 * Menukar posisi id dengan tetangganya.
 * Mengembalikan null kalau id tidak ada, dan daftar yang sama kalau sudah di ujung.
 */
export function moveId(
    ids: string[],
    id: string,
    direction: Direction,
): string[] | null {
    const index = ids.indexOf(id);
    if (index === -1) return null;

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ids.length) return ids;

    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}
