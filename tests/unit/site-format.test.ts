import { describe, expect, it } from "vitest";
import { parseDescription } from "@/lib/description-lines";
import {
    formatMonthYearEn,
    formatPeriodEn,
    formatYearRangeEn,
    initialsOf,
    yearOf,
} from "@/lib/site-format";

describe("format tanggal bahasa Inggris", () => {
    it("bulan dan tahun dibaca dari teks", () => {
        expect(formatMonthYearEn("2025-03-10")).toBe("Mar 2025");
        expect(formatMonthYearEn("2025-13-01")).toBe("2025-13-01");
        expect(yearOf("2025-08-17")).toBe("2025");
    });

    it("rentang pengalaman: berjalan, selesai, dan bulan yang sama", () => {
        expect(formatPeriodEn("2025-03-10", null)).toBe(
            "Mar 2025 \u2013 Present",
        );
        expect(formatPeriodEn("2024-03-01", "2025-08-31")).toBe(
            "Mar 2024 \u2013 Aug 2025",
        );
        expect(formatPeriodEn("2024-03-01", "2024-03-20")).toBe("Mar 2024");
    });

    it("rentang pendidikan: berjalan, selesai, dan tahun yang sama", () => {
        expect(formatYearRangeEn(2023, null)).toBe("2023 \u2013 Present");
        expect(formatYearRangeEn(2020, 2023)).toBe("2020 \u2013 2023");
        expect(formatYearRangeEn(2023, 2023)).toBe("2023");
    });
});

describe("initialsOf", () => {
    it("mengambil huruf awal dua kata pertama", () => {
        expect(initialsOf("House Price Prediction")).toBe("HP");
        expect(initialsOf("  campus  ")).toBe("C");
        expect(initialsOf("")).toBe("");
    });
});

describe("parseDescription", () => {
    it("memisahkan pengantar dan poin", () => {
        expect(
            parseDescription(
                "Built the site.\n- Taught Git\n* Reviewed code\n\n\u2022 Mentored",
            ),
        ).toEqual({
            intro: ["Built the site."],
            bullets: ["Taught Git", "Reviewed code", "Mentored"],
        });
    });

    it("aman untuk null, tanda saja, dan tanda tanpa spasi", () => {
        expect(parseDescription(null)).toEqual({ intro: [], bullets: [] });
        expect(parseDescription("-")).toEqual({ intro: [], bullets: [] });
        expect(parseDescription("- \n-x")).toEqual({
            intro: ["-x"],
            bullets: [],
        });
    });
});
