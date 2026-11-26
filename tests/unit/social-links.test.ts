import { describe, expect, it } from "vitest";
import { isMailto, socialLinkInputSchema } from "@/lib/validators/social-links";

const base = {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/yogi",
    isVisible: true,
};
const ok = (o: object) =>
    socialLinkInputSchema.safeParse({ ...base, ...o }).success;

describe("socialLinkInputSchema", () => {
    it("menerima tautan https dan mailto yang valid", () => {
        expect(ok({})).toBe(true);
        expect(ok({ platform: "email", url: "mailto:yogi@example.com" })).toBe(
            true,
        );
    });

    it("menolak skema berbahaya, mailto rusak, dan tautan kosong", () => {
        expect(ok({ url: "javascript:alert(1)" })).toBe(false);
        expect(ok({ url: "mailto:abc" })).toBe(false);
        expect(ok({ url: "" })).toBe(false);
    });

    it("menolak platform di luar daftar dan teks tampilan kosong", () => {
        expect(ok({ platform: "tiktok" })).toBe(false);
        expect(ok({ label: " " })).toBe(false);
    });

    it("isMailto memeriksa alamat", () => {
        expect(isMailto("mailto:a@b.id")).toBe(true);
        expect(isMailto("https://a.b")).toBe(false);
    });
});
