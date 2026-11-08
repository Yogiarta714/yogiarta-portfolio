export type FieldErrors = Record<string, string[] | undefined>;

export type ActionErrorCode =
    | "VALIDATION"
    | "UNAUTHORIZED"
    | "RATE_LIMITED"
    | "CONFLICT"
    | "DATABASE"
    | "UNKNOWN";

export type ActionError = {
    code: ActionErrorCode;
    message: string;
    fields?: FieldErrors;
};

export type ActionResult<T = null> =
    { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): ActionResult<T> {
    return { ok: true, data };
}

export function fail(
    code: ActionErrorCode,
    message: string,
    fields?: FieldErrors,
): ActionResult<never> {
    return { ok: false, error: { code, message, fields } };
}
