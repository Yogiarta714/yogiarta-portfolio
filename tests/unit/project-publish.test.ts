import { describe, expect, it } from "vitest";
import { resolvePublishedAt } from "@/lib/project-publish";

describe("resolvePublishedAt", () => {
    const now = new Date("2026-11-16T08:00:00Z");
    const earlier = new Date("2026-01-01T00:00:00Z");

    it("mengisi waktu terbit saat pertama kali dipublikasikan", () => {
        expect(resolvePublishedAt("published", null, now)).toBe(now);
    });

    it("mempertahankan waktu terbit yang sudah ada", () => {
        expect(resolvePublishedAt("published", earlier, now)).toBe(earlier);
    });

    it("tidak menghapus riwayat saat ditarik kembali ke draft", () => {
        expect(resolvePublishedAt("draft", earlier, now)).toBe(earlier);
        expect(resolvePublishedAt("draft", null, now)).toBeNull();
    });
});
