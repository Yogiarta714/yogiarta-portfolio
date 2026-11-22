import { z } from "zod";
import {
    optionalHttpUrl,
    optionalText,
    optionalUuid,
    requiredText,
} from "@/lib/validators/fields";
import { isValidDateString } from "@/lib/validators/projects";

const requiredDate = (label: string) =>
    z
        .string()
        .trim()
        .min(1, `${label} wajib diisi`)
        .refine(isValidDateString, `${label} tidak valid`);

export const certificateInputSchema = z.object({
    title: requiredText("Judul sertifikat", 150),
    issuer: requiredText("Penerbit", 120),
    issuedDate: requiredDate("Tanggal terbit"),
    credentialUrl: optionalHttpUrl("Tautan kredensial"),
    fileMediaId: optionalUuid("File"),
    isVisible: z.boolean(),
});

export const achievementInputSchema = z.object({
    title: requiredText("Judul prestasi", 150),
    organizer: optionalText("Penyelenggara", 120),
    level: optionalText("Tingkat", 60),
    achievedDate: requiredDate("Tanggal"),
    description: optionalText("Deskripsi", 2000),
    proofUrl: optionalHttpUrl("Tautan bukti"),
    isVisible: z.boolean(),
});

export type CertificateInput = z.input<typeof certificateInputSchema>;
export type CertificateData = z.output<typeof certificateInputSchema>;
export type AchievementInput = z.input<typeof achievementInputSchema>;
export type AchievementData = z.output<typeof achievementInputSchema>;
