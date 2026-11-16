import { describe, expect, it } from "vitest";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";

describe("db-errors", () => {
    it("mengenali kode error langsung", () => {
        expect(isUniqueViolation({ code: "23505" })).toBe(true);
        expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
    });

    it("mengenali kode error yang dibungkus di cause", () => {
        expect(
            isUniqueViolation({ message: "gagal", cause: { code: "23505" } }),
        ).toBe(true);
    });

    it("menolak error lain", () => {
        expect(isUniqueViolation({ code: "23503" })).toBe(false);
        expect(isUniqueViolation(new Error("x"))).toBe(false);
        expect(isUniqueViolation(null)).toBe(false);
    });
});
