import { headers } from "next/headers";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

import { getClientIpHash } from "@/lib/auth/rate-limit";

function pakaiHeader(nilai: Record<string, string>) {
    vi.mocked(headers).mockResolvedValue(new Headers(nilai) as never);
}

describe("getClientIpHash", () => {
    it("IP yang sama menghasilkan hash yang sama, walau melewati proxy", async () => {
        pakaiHeader({ "x-forwarded-for": "203.0.113.7" });
        const a = await getClientIpHash();
        pakaiHeader({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
        const b = await getClientIpHash();
        expect(a).toBe(b);
    });

    it("IP berbeda menghasilkan hash berbeda", async () => {
        pakaiHeader({ "x-forwarded-for": "203.0.113.7" });
        const a = await getClientIpHash();
        pakaiHeader({ "x-forwarded-for": "203.0.113.8" });
        const b = await getClientIpHash();
        expect(a).not.toBe(b);
    });

    it("hasilnya 64 karakter heksadesimal dan tidak memuat IP mentah", async () => {
        pakaiHeader({ "x-forwarded-for": "203.0.113.7" });
        const hash = await getClientIpHash();
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
        expect(hash).not.toContain("203.0.113.7");
    });

    it("tanpa header IP tetap menghasilkan hash", async () => {
        pakaiHeader({});
        expect(await getClientIpHash()).toMatch(/^[0-9a-f]{64}$/);
    });
});
