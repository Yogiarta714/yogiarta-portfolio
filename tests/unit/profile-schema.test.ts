import { describe, expect, it } from "vitest";
import {
    profileSchema,
    readProfileForm,
    toProfileValues,
} from "@/lib/validators/profile";

function formWith(overrides: Record<string, string> = {}) {
    const fd = new FormData();
    const base: Record<string, string> = {
        fullName: "I Kadek Yogiarta Adi Winata",
        shortName: "Yogiarta",
        heroTitle: "Mahasiswa Informatika",
        heroSummary: "Ringkasan singkat.",
    };
    for (const key of Object.keys(profileSchema.shape)) {
        fd.set(key, overrides[key] ?? base[key] ?? "");
    }
    return fd;
}

describe("profileSchema", () => {
    it("menerima data minimal dan mengubah kolom opsional kosong menjadi null", () => {
        const result = profileSchema.safeParse(readProfileForm(formWith()));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.university).toBeNull();
            expect(result.data.publicEmail).toBeNull();
            expect(result.data.aboutBodyMd).toBe("");
        }
    });

    it("menolak kolom wajib yang kosong", () => {
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ fullName: "   " })),
        );
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.fullName).toBeDefined();
        }
    });

    it("menolak email yang formatnya salah", () => {
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ publicEmail: "bukan-email" })),
        );
        expect(result.success).toBe(false);
    });

    it("menerima email yang benar dan merapikan spasi", () => {
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ publicEmail: "  halo@contoh.id  " })),
        );
        expect(result.success).toBe(true);
        if (result.success)
            expect(result.data.publicEmail).toBe("halo@contoh.id");
    });

    it("menolak deskripsi SEO lebih dari 160 karakter", () => {
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ seoDescription: "a".repeat(161) })),
        );
        expect(result.success).toBe(false);
    });

    it("readProfileForm mengisi string kosong untuk field yang tidak dikirim", () => {
        const raw = readProfileForm(new FormData());
        expect(raw.fullName).toBe("");
        expect(Object.keys(raw)).toEqual(Object.keys(profileSchema.shape));
    });

    it("menerima uuid media yang benar dan mengubah kosong menjadi null", () => {
        const id = "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b";
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ avatarMediaId: id })),
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.avatarMediaId).toBe(id);
            expect(result.data.cvMediaId).toBeNull();
        }
    });

    it("menolak id media yang bukan uuid", () => {
        const result = profileSchema.safeParse(
            readProfileForm(formWith({ cvMediaId: "bukan-uuid" })),
        );
        expect(result.success).toBe(false);
    });
});

describe("toProfileValues", () => {
    it("mengubah null jadi string kosong dan menyalin nilai yang ada", () => {
        const values = toProfileValues({ fullName: "Yogi", university: null });
        expect(values.fullName).toBe("Yogi");
        expect(values.university).toBe("");
        expect(values.seoTitle).toBe("");
    });

    it("mengembalikan semua kolom kosong kalau baris belum ada", () => {
        const values = toProfileValues(null);
        expect(Object.keys(values)).toEqual(Object.keys(profileSchema.shape));
        expect(Object.values(values).every((v) => v === "")).toBe(true);
    });
});
