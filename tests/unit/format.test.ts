import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/format";

describe("formatBytes", () => {
    it("memformat byte, KB, dan MB", () => {
        expect(formatBytes(512)).toBe("512 B");
        expect(formatBytes(2048)).toBe("2 KB");
        expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
    });
});
