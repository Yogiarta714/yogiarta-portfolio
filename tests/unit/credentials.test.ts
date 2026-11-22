import { describe, expect, it } from "vitest";
import type {
    AchievementRow,
    CertificateRow,
} from "@/lib/admin-queries/credentials";
import {
    toAchievementValues,
    toCertificateValues,
} from "@/lib/credentials-form";
import {
    achievementInputSchema,
    certificateInputSchema,
} from "@/lib/validators/credentials";

const certificate = {
    title: "Dasar Pemrograman Web",
    issuer: "Dicoding",
    issuedDate: "2025-03-10",
    credentialUrl: "",
    fileMediaId: "",
    isVisible: true,
};

const achievement = {
    title: "Finalis Lomba Aplikasi",
    organizer: "",
    level: "",
    achievedDate: "2025-08-17",
    description: "",
    proofUrl: "",
    isVisible: true,
};

const certificateRow: CertificateRow = {
    id: "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b",
    title: "Dasar Pemrograman Web",
    issuer: "Dicoding",
    issuedDate: "2025-03-10",
    credentialUrl: null,
    fileMediaId: null,
    fileName: null,
    isVisible: false,
};

const achievementRow: AchievementRow = {
    id: "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d",
    title: "Finalis Lomba Aplikasi",
    organizer: null,
    level: "Nasional",
    achievedDate: "2025-08-17",
    description: null,
    proofUrl: null,
    isVisible: true,
};

describe("certificateInputSchema", () => {
    it("menerima data minimal dan mengubah kolom opsional kosong menjadi null", () => {
        const result = certificateInputSchema.safeParse(certificate);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.credentialUrl).toBeNull();
            expect(result.data.fileMediaId).toBeNull();
        }
    });

    it("menerima id file yang valid dan menolak yang bukan uuid", () => {
        const id = "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b";
        const ok = certificateInputSchema.safeParse({
            ...certificate,
            fileMediaId: id,
        });
        expect(ok.success).toBe(true);
        if (ok.success) expect(ok.data.fileMediaId).toBe(id);
        expect(
            certificateInputSchema.safeParse({
                ...certificate,
                fileMediaId: "abc",
            }).success,
        ).toBe(false);
    });

    it("menolak tautan berbahaya dan tanggal tidak valid", () => {
        expect(
            certificateInputSchema.safeParse({
                ...certificate,
                credentialUrl: "javascript:alert(1)",
            }).success,
        ).toBe(false);
        expect(
            certificateInputSchema.safeParse({
                ...certificate,
                credentialUrl: "https://dicoding.com/c/1",
            }).success,
        ).toBe(true);
        expect(
            certificateInputSchema.safeParse({ ...certificate, issuedDate: "" })
                .success,
        ).toBe(false);
        expect(
            certificateInputSchema.safeParse({
                ...certificate,
                issuedDate: "2025-13-01",
            }).success,
        ).toBe(false);
    });

    it("mewajibkan judul dan penerbit", () => {
        expect(
            certificateInputSchema.safeParse({ ...certificate, title: " " })
                .success,
        ).toBe(false);
        expect(
            certificateInputSchema.safeParse({ ...certificate, issuer: "" })
                .success,
        ).toBe(false);
    });
});

describe("achievementInputSchema", () => {
    it("menerima data minimal dan mengubah kolom opsional kosong menjadi null", () => {
        const result = achievementInputSchema.safeParse(achievement);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.organizer).toBeNull();
            expect(result.data.level).toBeNull();
            expect(result.data.description).toBeNull();
            expect(result.data.proofUrl).toBeNull();
        }
    });

    it("menolak tautan bukti berbahaya dan tanggal tidak valid", () => {
        expect(
            achievementInputSchema.safeParse({
                ...achievement,
                proofUrl: "ftp://x.id",
            }).success,
        ).toBe(false);
        expect(
            achievementInputSchema.safeParse({
                ...achievement,
                achievedDate: "kemarin",
            }).success,
        ).toBe(false);
    });

    it("membatasi panjang tingkat dan mewajibkan judul", () => {
        expect(
            achievementInputSchema.safeParse({
                ...achievement,
                level: "x".repeat(61),
            }).success,
        ).toBe(false);
        expect(
            achievementInputSchema.safeParse({ ...achievement, title: "" })
                .success,
        ).toBe(false);
    });
});

describe("nilai awal form", () => {
    it("sertifikat baru: kosong, tanggal hari ini, tampil", () => {
        const values = toCertificateValues(null, "2026-11-19");
        expect(values.title).toBe("");
        expect(values.issuedDate).toBe("2026-11-19");
        expect(values.isVisible).toBe(true);
    });

    it("sertifikat dari database: null menjadi string kosong dan status tampil dijaga", () => {
        const values = toCertificateValues(certificateRow, "2026-11-19");
        expect(values.credentialUrl).toBe("");
        expect(values.fileMediaId).toBe("");
        expect(values.isVisible).toBe(false);
        expect(certificateInputSchema.safeParse(values).success).toBe(true);
    });

    it("prestasi baru dan dari database lolos validasi", () => {
        const fresh = toAchievementValues(null, "2026-11-19");
        expect(fresh.achievedDate).toBe("2026-11-19");
        const values = toAchievementValues(achievementRow, "2026-11-19");
        expect(values.organizer).toBe("");
        expect(values.level).toBe("Nasional");
        expect(achievementInputSchema.safeParse(values).success).toBe(true);
    });
});
