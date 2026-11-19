import { describe, expect, it } from "vitest";
import {
    educationInputSchema,
    experienceInputSchema,
} from "@/lib/validators/career";

const experience = {
    kind: "organization" as const,
    organization: "Himpunan Mahasiswa Informatika",
    roleTitle: "Staf Divisi Teknologi",
    location: "",
    startDate: "2025-01-15",
    endDate: "",
    descriptionMd: "",
    url: "",
    isVisible: true,
};

const education = {
    institution: "Universitas Udayana",
    degree: "S1",
    field: "Informatika",
    startYear: "2023",
    endYear: "",
    descriptionMd: "",
    isVisible: true,
};

describe("experienceInputSchema", () => {
    it("menerima data minimal dan mengubah kolom opsional kosong menjadi null", () => {
        const result = experienceInputSchema.safeParse(experience);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.location).toBeNull();
            expect(result.data.endDate).toBeNull();
            expect(result.data.url).toBeNull();
            expect(result.data.descriptionMd).toBeNull();
        }
    });

    it("menolak tanggal selesai sebelum tanggal mulai pada kolom tanggal selesai", () => {
        const result = experienceInputSchema.safeParse({
            ...experience,
            endDate: "2024-12-31",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === "endDate"),
            ).toBe(true);
        }
    });

    it("menerima tanggal selesai yang sama atau sesudah tanggal mulai", () => {
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                endDate: "2025-01-15",
            }).success,
        ).toBe(true);
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                endDate: "2025-06-30",
            }).success,
        ).toBe(true);
    });

    it("menolak tanggal yang tidak valid", () => {
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                startDate: "2025-02-30",
            }).success,
        ).toBe(false);
        expect(
            experienceInputSchema.safeParse({ ...experience, startDate: "" })
                .success,
        ).toBe(false);
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                endDate: "kemarin",
            }).success,
        ).toBe(false);
    });

    it("menolak jenis yang tidak dikenal dan tautan berbahaya", () => {
        expect(
            experienceInputSchema.safeParse({ ...experience, kind: "intern" })
                .success,
        ).toBe(false);
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                url: "javascript:alert(1)",
            }).success,
        ).toBe(false);
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                url: "https://contoh.id",
            }).success,
        ).toBe(true);
    });

    it("mewajibkan organisasi dan jabatan", () => {
        expect(
            experienceInputSchema.safeParse({
                ...experience,
                organization: "  ",
            }).success,
        ).toBe(false);
        expect(
            experienceInputSchema.safeParse({ ...experience, roleTitle: "" })
                .success,
        ).toBe(false);
    });
});

describe("educationInputSchema", () => {
    it("mengubah tahun menjadi angka dan tahun selesai kosong menjadi null", () => {
        const result = educationInputSchema.safeParse(education);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.startYear).toBe(2023);
            expect(result.data.endYear).toBeNull();
        }
    });

    it("menerima tahun selesai yang sama atau sesudah tahun mulai", () => {
        const result = educationInputSchema.safeParse({
            ...education,
            endYear: "2027",
        });
        expect(result.success).toBe(true);
        if (result.success) expect(result.data.endYear).toBe(2027);
        expect(
            educationInputSchema.safeParse({ ...education, endYear: "2023" })
                .success,
        ).toBe(true);
    });

    it("menolak tahun selesai sebelum tahun mulai pada kolom tahun selesai", () => {
        const result = educationInputSchema.safeParse({
            ...education,
            endYear: "2020",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.some((i) => i.path[0] === "endYear"),
            ).toBe(true);
        }
    });

    it("menolak tahun yang bukan 4 digit atau di luar batas wajar", () => {
        for (const startYear of [
            "23",
            "20233",
            "dua ribu",
            "1800",
            "2300",
            "",
        ]) {
            expect(
                educationInputSchema.safeParse({ ...education, startYear })
                    .success,
            ).toBe(false);
        }
    });

    it("mewajibkan institusi, jenjang, dan program studi", () => {
        expect(
            educationInputSchema.safeParse({ ...education, institution: "" })
                .success,
        ).toBe(false);
        expect(
            educationInputSchema.safeParse({ ...education, degree: "" })
                .success,
        ).toBe(false);
        expect(
            educationInputSchema.safeParse({ ...education, field: " " })
                .success,
        ).toBe(false);
    });
});
