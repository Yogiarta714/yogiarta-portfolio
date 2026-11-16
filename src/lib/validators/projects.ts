import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidDateString(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

const required = (label: string, max: number) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .max(max, `${label} maksimal ${max} karakter`);

const optionalText = (label: string, max: number) =>
    z
        .string()
        .trim()
        .max(max, `${label} maksimal ${max} karakter`)
        .transform((v) => (v === "" ? null : v));

const optionalHttpUrl = (label: string) =>
    z
        .string()
        .trim()
        .max(300, `${label} maksimal 300 karakter`)
        .refine(
            (v) => v === "" || isHttpUrl(v),
            `${label} harus berupa tautan http atau https`,
        )
        .transform((v) => (v === "" ? null : v));

export const projectStatusSchema = z.enum(["draft", "published"]);

export const projectInputSchema = z
    .object({
        title: required("Judul", 120),
        slug: z
            .string()
            .trim()
            .min(1, "Slug wajib diisi")
            .max(80, "Slug maksimal 80 karakter")
            .regex(
                SLUG_PATTERN,
                "Slug hanya boleh huruf kecil, angka, dan tanda hubung",
            ),
        summary: required("Ringkasan", 300),
        descriptionMd: z
            .string()
            .trim()
            .max(20000, "Deskripsi maksimal 20000 karakter"),
        category: required("Kategori", 40),
        projectDate: z
            .string()
            .trim()
            .refine(isValidDateString, "Tanggal tidak valid"),
        role: optionalText("Peran", 80),
        githubUrl: optionalHttpUrl("Tautan GitHub"),
        demoUrl: optionalHttpUrl("Tautan demo"),
        thumbnailMediaId: z.string().uuid().nullable(),
        status: projectStatusSchema,
        isFeatured: z.boolean(),
        technologyIds: z
            .array(z.string().uuid())
            .max(30, "Maksimal 30 teknologi")
            .refine(
                (ids) => new Set(ids).size === ids.length,
                "Teknologi tidak boleh ganda",
            ),
        gallery: z
            .array(
                z.object({
                    mediaId: z.string().uuid(),
                    caption: optionalText("Keterangan", 200),
                }),
            )
            .max(20, "Maksimal 20 gambar galeri")
            .refine(
                (items) =>
                    new Set(items.map((i) => i.mediaId)).size === items.length,
                "Gambar galeri tidak boleh ganda",
            ),
    })
    .superRefine((data, ctx) => {
        if (data.status === "published" && !data.thumbnailMediaId) {
            ctx.addIssue({
                code: "custom",
                path: ["thumbnailMediaId"],
                message: "Thumbnail wajib diisi sebelum proyek dipublikasikan",
            });
        }
    });

export type ProjectInput = z.input<typeof projectInputSchema>;
export type ProjectData = z.output<typeof projectInputSchema>;
