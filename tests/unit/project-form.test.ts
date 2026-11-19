import { describe, expect, it } from "vitest";
import type { ProjectEditData } from "@/lib/admin-queries/projects";
import { toActionInput, toFormValues } from "@/lib/project-form";
import { projectInputSchema } from "@/lib/validators/projects";

const project: ProjectEditData = {
    id: "3f8e1c2a-5b7d-4e9f-8a1b-2c3d4e5f6a7b",
    slug: "sistem-kasir",
    title: "Sistem Kasir",
    summary: "Aplikasi kasir.",
    descriptionMd: "Isi",
    category: "web",
    projectDate: "2025-03-01",
    role: null,
    githubUrl: null,
    demoUrl: "https://contoh.id",
    thumbnailMediaId: null,
    status: "draft",
    isFeatured: false,
    technologyIds: [],
    gallery: [
        { mediaId: "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d", caption: null },
    ],
};

describe("toFormValues", () => {
    it("memberi nilai awal kosong untuk proyek baru dengan tanggal hari ini", () => {
        const values = toFormValues(null, "2026-11-16");
        expect(values.title).toBe("");
        expect(values.projectDate).toBe("2026-11-16");
        expect(values.status).toBe("draft");
    });

    it("mengubah null dari database menjadi string kosong", () => {
        const values = toFormValues(project, "2026-11-16");
        expect(values.role).toBe("");
        expect(values.thumbnailMediaId).toBe("");
        expect(values.gallery[0].caption).toBe("");
        expect(values.demoUrl).toBe("https://contoh.id");
    });
});

describe("toActionInput", () => {
    it("mengubah thumbnail kosong menjadi null dan lolos validasi", () => {
        const input = toActionInput(toFormValues(project, "2026-11-16"));
        expect(input.thumbnailMediaId).toBeNull();
        expect(projectInputSchema.safeParse(input).success).toBe(true);
    });
});
