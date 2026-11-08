import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validators/auth";

describe("loginSchema", () => {
    it("menerima isian yang benar", () => {
        const hasil = loginSchema.safeParse({
            email: "admin@contoh.com",
            password: "apa-saja",
        });
        expect(hasil.success).toBe(true);
    });

    it("merapikan email: spasi dibuang dan huruf kecil", () => {
        const hasil = loginSchema.parse({
            email: "  Admin@Contoh.COM ",
            password: "x",
        });
        expect(hasil.email).toBe("admin@contoh.com");
    });

    it("menolak format email yang salah", () => {
        expect(
            loginSchema.safeParse({ email: "bukan-email", password: "x" })
                .success,
        ).toBe(false);
    });

    it("menolak email kosong dan password kosong", () => {
        expect(
            loginSchema.safeParse({ email: "", password: "x" }).success,
        ).toBe(false);
        expect(
            loginSchema.safeParse({ email: "a@b.co", password: "" }).success,
        ).toBe(false);
    });

    it("menolak email lebih dari 254 karakter", () => {
        const email = `${"a".repeat(250)}@b.co`;
        expect(loginSchema.safeParse({ email, password: "x" }).success).toBe(
            false,
        );
    });

    it("menolak password lebih dari 200 karakter", () => {
        expect(
            loginSchema.safeParse({
                email: "a@b.co",
                password: "x".repeat(201),
            }).success,
        ).toBe(false);
    });
});
