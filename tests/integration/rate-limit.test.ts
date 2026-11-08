import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import {
    MAX_FAILED_ATTEMPTS,
    isRateLimited,
    recordAttempt,
} from "@/lib/auth/rate-limit";

const dipakai: string[] = [];
function ipBaru() {
    const hash = `tes-${randomUUID()}`;
    dipakai.push(hash);
    return hash;
}

describe.skipIf(!process.env.TEST_DATABASE_URL)("rate limiting login", () => {
    afterAll(async () => {
        if (dipakai.length > 0) {
            await db
                .delete(loginAttempts)
                .where(inArray(loginAttempts.ipHash, dipakai));
        }
    });

    it("tidak terblokir bila belum ada percobaan", async () => {
        expect(await isRateLimited(ipBaru())).toBe(false);
    });

    it("terblokir tepat setelah 5 kali gagal", async () => {
        const ip = ipBaru();
        for (let i = 0; i < MAX_FAILED_ATTEMPTS - 1; i++) {
            await recordAttempt(ip, false);
        }
        expect(await isRateLimited(ip)).toBe(false); // baru 4 kali
        await recordAttempt(ip, false);
        expect(await isRateLimited(ip)).toBe(true); // 5 kali
    });

    it("percobaan yang berhasil tidak dihitung", async () => {
        const ip = ipBaru();
        for (let i = 0; i < MAX_FAILED_ATTEMPTS + 2; i++) {
            await recordAttempt(ip, true);
        }
        expect(await isRateLimited(ip)).toBe(false);
    });

    it("IP lain tidak ikut terblokir", async () => {
        const terblokir = ipBaru();
        const lain = ipBaru();
        for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
            await recordAttempt(terblokir, false);
        }
        expect(await isRateLimited(terblokir)).toBe(true);
        expect(await isRateLimited(lain)).toBe(false);
    });

    it("kegagalan yang lebih tua dari 15 menit tidak dihitung", async () => {
        const ip = ipBaru();
        const enamBelasMenitLalu = new Date(Date.now() - 16 * 60 * 1000);
        await db.insert(loginAttempts).values(
            Array.from({ length: MAX_FAILED_ATTEMPTS }, () => ({
                ipHash: ip,
                succeeded: false,
                attemptedAt: enamBelasMenitLalu,
            })),
        );
        expect(await isRateLimited(ip)).toBe(false);
    });
});
