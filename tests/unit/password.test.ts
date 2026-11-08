import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password", () => {
    it("hash bisa diverifikasi dengan password yang benar", async () => {
        const hash = await hashPassword("password-yang-panjang-123");
        expect(await verifyPassword("password-yang-panjang-123", hash)).toBe(
            true,
        );
    });

    it("password yang salah ditolak", async () => {
        const hash = await hashPassword("password-yang-panjang-123");
        expect(await verifyPassword("password-lain", hash)).toBe(false);
    });

    it("memakai bcrypt dengan cost 12", async () => {
        const hash = await hashPassword("password-yang-panjang-123");
        expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });

    it("password yang sama menghasilkan hash berbeda (salt acak)", async () => {
        const a = await hashPassword("password-yang-panjang-123");
        const b = await hashPassword("password-yang-panjang-123");
        expect(a).not.toBe(b);
    });
});
