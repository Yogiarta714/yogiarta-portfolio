function codeOf(error: unknown): string | undefined {
    let current: unknown = error;
    // Driver bisa membungkus error asli di properti `cause`.
    for (
        let depth = 0;
        depth < 3 && typeof current === "object" && current !== null;
        depth++
    ) {
        const code = (current as { code?: unknown }).code;
        if (typeof code === "string") return code;
        current = (current as { cause?: unknown }).cause;
    }
    return undefined;
}

export const isUniqueViolation = (error: unknown) => codeOf(error) === "23505";
export const isForeignKeyViolation = (error: unknown) =>
    codeOf(error) === "23503";
