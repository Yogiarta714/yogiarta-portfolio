import { SignJWT, UnsecuredJWT } from "jose";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

import { createSessionToken, verifySessionToken } from "@/lib/auth/session";

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const payload = { adminId: "admin-1", sessionVersion: 3 };

describe("sesi JWT", () => {
    it("token yang dibuat bisa diverifikasi dan isinya sama", async () => {
        const token = await createSessionToken(payload);
        expect(await verifySessionToken(token)).toEqual(payload);
    });

    it("tanpa token hasilnya null", async () => {
        expect(await verifySessionToken(undefined)).toBeNull();
        expect(await verifySessionToken("")).toBeNull();
    });

    it("token sembarang ditolak", async () => {
        expect(await verifySessionToken("bukan-token")).toBeNull();
    });

    it("isi token yang dipalsukan ditolak", async () => {
        const token = await createSessionToken(payload);
        const [header, , signature] = token.split(".");
        const palsu = Buffer.from(
            JSON.stringify({ adminId: "orang-lain", sessionVersion: 3 }),
        ).toString("base64url");
        expect(
            await verifySessionToken(`${header}.${palsu}.${signature}`),
        ).toBeNull();
    });

    it("token yang sudah kedaluwarsa ditolak", async () => {
        const token = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
            .sign(key);
        expect(await verifySessionToken(token)).toBeNull();
    });

    it("token yang ditandatangani kunci lain ditolak", async () => {
        const kunciLain = new TextEncoder().encode("kunci-lain-".repeat(6));
        const token = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(kunciLain);
        expect(await verifySessionToken(token)).toBeNull();
    });

    it("algoritma selain HS256 ditolak", async () => {
        const token = await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: "HS512" })
            .setExpirationTime("7d")
            .sign(key);
        expect(await verifySessionToken(token)).toBeNull();
    });

    it("token tanpa tanda tangan (alg none) ditolak", async () => {
        const token = new UnsecuredJWT({ ...payload })
            .setExpirationTime("7d")
            .encode();
        expect(await verifySessionToken(token)).toBeNull();
    });

    it("isi token yang tidak lengkap atau salah tipe ditolak", async () => {
        const tanpaVersi = await new SignJWT({ adminId: "admin-1" })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(key);
        const versiString = await new SignJWT({
            adminId: "admin-1",
            sessionVersion: "3",
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(key);
        expect(await verifySessionToken(tanpaVersi)).toBeNull();
        expect(await verifySessionToken(versiString)).toBeNull();
    });
});
