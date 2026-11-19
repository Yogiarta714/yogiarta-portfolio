import { z } from "zod";

export function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export const requiredText = (label: string, max: number) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .max(max, `${label} maksimal ${max} karakter`);

export const optionalText = (label: string, max: number) =>
    z
        .string()
        .trim()
        .max(max, `${label} maksimal ${max} karakter`)
        .transform((v) => (v === "" ? null : v));

export const optionalHttpUrl = (label: string) =>
    z
        .string()
        .trim()
        .max(300, `${label} maksimal 300 karakter`)
        .refine(
            (v) => v === "" || isHttpUrl(v),
            `${label} harus berupa tautan http atau https`,
        )
        .transform((v) => (v === "" ? null : v));
