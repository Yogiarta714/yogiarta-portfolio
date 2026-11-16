import { z } from "zod";

export const idSchema = z.string().uuid();
export const directionSchema = z.enum(["up", "down"]);

const name = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .max(60, `${label} maksimal 60 karakter`);

export const categoryInputSchema = z.object({
    name: name("Nama kategori"),
});

export const technologyInputSchema = z.object({
    name: name("Nama teknologi"),
    categoryId: z.string().uuid().nullable(),
    showInSkills: z.boolean(),
});

export type CategoryInput = z.input<typeof categoryInputSchema>;
export type TechnologyInput = z.input<typeof technologyInputSchema>;
