import { describe, expect, it } from "vitest";
import type { EducationRow, ExperienceRow } from "@/lib/admin-queries/career";
import {
    formatMonthYear,
    formatPeriod,
    formatYearRange,
} from "@/lib/career-format";
import {
    toEducationInput,
    toEducationValues,
    toExperienceInput,
    toExperienceValues,
} from "@/lib/career-form";
import {
    educationInputSchema,
    experienceInputSchema,
} from "@/lib/validators/career";

const experienceRow: ExperienceRow = {
    id: "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b",
    kind: "work",
    organization: "PT Contoh",
    roleTitle: "Pengembang Web",
    location: null,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    descriptionMd: null,
    url: null,
    isVisible: true,
};

const educationRow: EducationRow = {
    id: "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d",
    institution: "Universitas Udayana",
    degree: "S1",
    field: "Informatika",
    startYear: 2023,
    endYear: null,
    descriptionMd: null,
    isVisible: false,
};

describe("form pengalaman", () => {
    it("memberi nilai awal untuk data baru: masih berlangsung dan tampil", () => {
        const values = toExperienceValues(null, "2026-11-19");
        expect(values.ongoing).toBe(true);
        expect(values.startDate).toBe("2026-11-19");
        expect(values.isVisible).toBe(true);
    });

    it("mengubah null dari database menjadi string kosong dan membaca status berlangsung", () => {
        const done = toExperienceValues(experienceRow, "2026-11-19");
        expect(done.location).toBe("");
        expect(done.ongoing).toBe(false);
        expect(done.endDate).toBe("2024-09-30");

        const ongoing = toExperienceValues(
            { ...experienceRow, endDate: null },
            "2026-11-19",
        );
        expect(ongoing.ongoing).toBe(true);
    });

    it("mengosongkan tanggal selesai saat masih berlangsung dan lolos validasi", () => {
        const values = {
            ...toExperienceValues(null, "2026-11-19"),
            organization: "Himpunan Mahasiswa Informatika",
            roleTitle: "Staf Divisi Teknologi",
        };
        const input = toExperienceInput(values);
        expect(input.endDate).toBe("");
        expect(experienceInputSchema.safeParse(input).success).toBe(true);
    });

    it("mengirim tanggal selesai bila tidak lagi berlangsung", () => {
        const input = toExperienceInput(
            toExperienceValues(experienceRow, "2026-11-19"),
        );
        expect(input.endDate).toBe("2024-09-30");
    });
});

describe("form pendidikan", () => {
    it("memberi nilai awal dengan tahun ini", () => {
        const values = toEducationValues(null, "2026-11-19");
        expect(values.startYear).toBe("2026");
        expect(values.ongoing).toBe(true);
    });

    it("membaca baris dari database dan menjaga status tampil", () => {
        const values = toEducationValues(educationRow, "2026-11-19");
        expect(values.startYear).toBe("2023");
        expect(values.ongoing).toBe(true);
        expect(values.isVisible).toBe(false);
    });

    it("mengosongkan tahun selesai saat masih berlangsung dan lolos validasi", () => {
        const input = toEducationInput(
            toEducationValues(educationRow, "2026-11-19"),
        );
        expect(input.endYear).toBe("");
        expect(educationInputSchema.safeParse(input).success).toBe(true);
    });
});

describe("format periode", () => {
    it("menulis bulan dan tahun dalam bahasa Indonesia singkat", () => {
        expect(formatMonthYear("2024-03-15")).toBe("Mar 2024");
        expect(formatMonthYear("2024-05-01")).toBe("Mei 2024");
        expect(formatMonthYear("2024-08-01")).toBe("Agu 2024");
    });

    it("menulis periode dengan tanggal selesai atau sekarang", () => {
        expect(formatPeriod("2024-03-01", "2024-09-30")).toBe(
            "Mar 2024 - Sep 2024",
        );
        expect(formatPeriod("2025-01-01", null)).toBe("Jan 2025 - sekarang");
    });

    it("menulis rentang tahun", () => {
        expect(formatYearRange(2023, null)).toBe("2023 - sekarang");
        expect(formatYearRange(2019, 2023)).toBe("2019 - 2023");
        expect(formatYearRange(2024, 2024)).toBe("2024");
    });
});
