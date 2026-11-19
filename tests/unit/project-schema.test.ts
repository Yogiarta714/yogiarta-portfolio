import { describe, expect, it } from "vitest";
import {
    isValidDateString,
    projectInputSchema,
} from "@/lib/validators/projects";

const id1 = "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b";
const id2 = "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d";

const base = {
    title: "Prediksi Harga Rumah",
    slug: "prediksi-harga-rumah",
    summary: "Model regresi harga rumah.",
    descriptionMd: "",
    category: "Machine learning",
    projectDate: "2025-03-01",
    role: "",
    githubUrl: "",
    demoUrl: "",
    thumbnailMediaId: null,
    status: "draft" as const,
    isFeatured: false,
    technologyIds: [] as string[],
    gallery: [] as { mediaId: string; caption: string }[],
};

describe("projectInputSchema", () => {
    it("menerima data minimal dan mengubah kolom opsional kosong menjadi null", () => {
        const result = projectInputSchema.safeParse(base);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.role).toBeNull();
            expect(result.data.githubUrl).toBeNull();
        }
    });

    it("menolak slug yang tidak rapi", () => {
        for (const slug of [
            "Judul Baru",
            "-awal",
            "dua--strip",
            "akhir-",
            "UPPER",
        ]) {
            expect(
                projectInputSchema.safeParse({ ...base, slug }).success,
            ).toBe(false);
        }
    });

    it("memeriksa tanggal dengan benar", () => {
        expect(isValidDateString("2025-02-28")).toBe(true);
        expect(isValidDateString("2025-02-30")).toBe(false);
        expect(isValidDateString("2025-13-01")).toBe(false);
        expect(isValidDateString("1 Maret 2025")).toBe(false);
    });

    it("hanya menerima tautan http atau https", () => {
        expect(
            projectInputSchema.safeParse({
                ...base,
                githubUrl: "https://github.com/u/r",
            }).success,
        ).toBe(true);
        expect(
            projectInputSchema.safeParse({
                ...base,
                demoUrl: "javascript:alert(1)",
            }).success,
        ).toBe(false);
        expect(
            projectInputSchema.safeParse({ ...base, demoUrl: "bukan url" })
                .success,
        ).toBe(false);
    });

    it("menolak teknologi dan gambar galeri yang ganda", () => {
        expect(
            projectInputSchema.safeParse({ ...base, technologyIds: [id1, id1] })
                .success,
        ).toBe(false);
        expect(
            projectInputSchema.safeParse({
                ...base,
                gallery: [
                    { mediaId: id1, caption: "" },
                    { mediaId: id1, caption: "" },
                ],
            }).success,
        ).toBe(false);
    });

    it("menerima teknologi dan galeri yang valid dengan keterangan dirapikan", () => {
        const result = projectInputSchema.safeParse({
            ...base,
            technologyIds: [id1, id2],
            gallery: [{ mediaId: id1, caption: "  Halaman utama " }],
        });
        expect(result.success).toBe(true);
        if (result.success)
            expect(result.data.gallery[0].caption).toBe("Halaman utama");
    });

    it("menolak status di luar draft dan published", () => {
        expect(
            projectInputSchema.safeParse({ ...base, status: "archived" })
                .success,
        ).toBe(false);
    });

    it("membatasi galeri maksimal 20 gambar", () => {
        const gallery = Array.from({ length: 21 }, (_, i) => ({
            mediaId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
            caption: "",
        }));
        expect(projectInputSchema.safeParse({ ...base, gallery }).success).toBe(
            false,
        );
    });

    it("mewajibkan thumbnail untuk proyek yang terbit", () => {
        const result = projectInputSchema.safeParse({
            ...base,
            status: "published",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.thumbnailMediaId,
            ).toBeDefined();
        }
    });

    it("menerima proyek terbit yang punya thumbnail", () => {
        const result = projectInputSchema.safeParse({
            ...base,
            status: "published",
            thumbnailMediaId: id1,
        });
        expect(result.success).toBe(true);
    });
});
