import { z } from "zod";
import {
    optionalHttpUrl,
    optionalText,
    requiredText,
} from "@/lib/validators/fields";
import { isValidDateString } from "@/lib/validators/projects";

export const EXPERIENCE_KINDS = ["work", "organization", "volunteer"] as const;

const MIN_YEAR = 1950;
const MAX_YEAR = 2100;

function isValidYear(value: string): boolean {
    return (
        /^\d{4}$/.test(value) &&
        Number(value) >= MIN_YEAR &&
        Number(value) <= MAX_YEAR
    );
}

const yearMessage = (label: string) =>
    `${label} harus tahun 4 digit (${MIN_YEAR} sampai ${MAX_YEAR})`;

const requiredYear = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .refine(isValidYear, yearMessage(label))
        .transform(Number);

const optionalYear = (label: string) =>
    z
        .string()
        .trim()
        .refine((v) => v === "" || isValidYear(v), yearMessage(label))
        .transform((v) => (v === "" ? null : Number(v)));

export const experienceInputSchema = z
    .object({
        kind: z.enum(EXPERIENCE_KINDS),
        organization: requiredText("Nama organisasi", 120),
        roleTitle: requiredText("Jabatan", 120),
        location: optionalText("Lokasi", 120),
        startDate: z
            .string()
            .trim()
            .min(1, "Tanggal mulai wajib diisi")
            .refine(isValidDateString, "Tanggal mulai tidak valid"),
        endDate: z
            .string()
            .trim()
            .refine(
                (v) => v === "" || isValidDateString(v),
                "Tanggal selesai tidak valid",
            )
            .transform((v) => (v === "" ? null : v)),
        descriptionMd: optionalText("Deskripsi", 5000),
        url: optionalHttpUrl("Tautan"),
        isVisible: z.boolean(),
    })
    .superRefine((value, ctx) => {
        const { startDate, endDate } = value;
        if (
            typeof endDate === "string" &&
            isValidDateString(startDate) &&
            endDate < startDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["endDate"],
                message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
            });
        }
    });

export const educationInputSchema = z
    .object({
        institution: requiredText("Nama institusi", 120),
        degree: requiredText("Jenjang", 60),
        field: requiredText("Program studi", 120),
        startYear: requiredYear("Tahun mulai"),
        endYear: optionalYear("Tahun selesai"),
        descriptionMd: optionalText("Deskripsi", 3000),
        isVisible: z.boolean(),
    })
    .superRefine((value, ctx) => {
        const { startYear, endYear } = value;
        if (
            typeof startYear === "number" &&
            typeof endYear === "number" &&
            endYear < startYear
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["endYear"],
                message: "Tahun selesai tidak boleh sebelum tahun mulai",
            });
        }
    });

export type ExperienceInput = z.input<typeof experienceInputSchema>;
export type ExperienceData = z.output<typeof experienceInputSchema>;
export type EducationInput = z.input<typeof educationInputSchema>;
export type EducationData = z.output<typeof educationInputSchema>;
