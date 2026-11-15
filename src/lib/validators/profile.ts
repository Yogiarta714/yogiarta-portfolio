import { z } from "zod";

const required = (label: string, max: number) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .max(max, `${label} maksimal ${max} karakter`);

// Kolom opsional: string kosong disimpan sebagai null
const optional = (label: string, max: number) =>
    z
        .string()
        .trim()
        .max(max, `${label} maksimal ${max} karakter`)
        .transform((v) => (v === "" ? null : v));

const optionalEmail = z
    .string()
    .trim()
    .max(254, "Email maksimal 254 karakter")
    .refine(
        (v) => v === "" || z.string().email().safeParse(v).success,
        "Format email tidak valid",
    )
    .transform((v) => (v === "" ? null : v));

const optionalUuid = (label: string) =>
    z
        .string()
        .trim()
        .refine(
            (v) => v === "" || z.string().uuid().safeParse(v).success,
            `${label} tidak valid`,
        )
        .transform((v) => (v === "" ? null : v));

export const profileSchema = z.object({
    fullName: required("Nama lengkap", 120),
    shortName: required("Nama pendek", 40),
    availabilityText: optional("Teks ketersediaan", 120),
    heroTitle: required("Judul hero", 200),
    heroSummary: required("Ringkasan hero", 500),
    aboutLead: optional("Kalimat pembuka tentang", 300),
    aboutBodyMd: z
        .string()
        .trim()
        .max(8000, "Isi tentang maksimal 8000 karakter"),
    university: optional("Kampus", 120),
    location: optional("Lokasi", 120),
    publicEmail: optionalEmail,
    contactHeading: optional("Judul kontak", 200),
    footerText: optional("Teks footer", 200),
    avatarMediaId: optionalUuid("Foto profil"),
    cvMediaId: optionalUuid("CV"),
    ogImageMediaId: optionalUuid("Gambar OG"),
    seoTitle: optional("Judul SEO", 70),
    seoDescription: optional("Deskripsi SEO", 160),
});

export type ProfileInput = z.output<typeof profileSchema>;

/** Ambil semua kolom profil dari FormData */
export function readProfileForm(formData: FormData): Record<string, string> {
    const raw: Record<string, string> = {};
    for (const key of Object.keys(profileSchema.shape)) {
        const value = formData.get(key);
        raw[key] = typeof value === "string" ? value : "";
    }
    return raw;
}

export type ProfileValues = Record<keyof ProfileInput, string>;

/** Ubah baris database (atau null) menjadi nilai awal form: null jadi string kosong. */
export function toProfileValues(
    row: Partial<Record<keyof ProfileInput, string | null>> | null,
): ProfileValues {
    const values = {} as ProfileValues;
    for (const key of Object.keys(
        profileSchema.shape,
    ) as (keyof ProfileInput)[]) {
        values[key] = row?.[key] ?? "";
    }
    return values;
}
