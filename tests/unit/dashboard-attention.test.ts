import { describe, expect, it } from "vitest";
import {
    buildAttentionItems,
    type DashboardSummary,
} from "@/lib/dashboard-attention";

const lengkap: DashboardSummary = {
    hasProfile: true,
    hasAvatar: true,
    hasCv: true,
    draftProjects: 0,
    publishedProjects: 2,
    technologies: 5,
    experiences: 1,
    education: 1,
    certificates: 1,
    achievements: 1,
    socialLinks: 3,
};

describe("buildAttentionItems", () => {
    it("kosong bila semuanya lengkap", () => {
        expect(buildAttentionItems(lengkap)).toEqual([]);
    });

    it("menyebut jumlah proyek draft", () => {
        const items = buildAttentionItems({ ...lengkap, draftProjects: 3 });
        expect(items).toHaveLength(1);
        expect(items[0]).toContain("3 proyek");
    });

    it("menyebut foto dan CV yang belum diunggah", () => {
        const items = buildAttentionItems({
            ...lengkap,
            hasAvatar: false,
            hasCv: false,
        });
        expect(items).toHaveLength(2);
    });

    it("tanpa profil, hanya menyebut profil (bukan foto dan CV)", () => {
        const items = buildAttentionItems({
            ...lengkap,
            hasProfile: false,
            hasAvatar: false,
            hasCv: false,
        });
        expect(items).toHaveLength(1);
        expect(items[0]).toContain("Profil belum dibuat");
    });

    it("menyebut bagian publik yang kosong", () => {
        const items = buildAttentionItems({
            ...lengkap,
            publishedProjects: 0,
            experiences: 0,
            achievements: 0,
        });
        expect(items).toHaveLength(3);
    });
});
