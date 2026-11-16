import { describe, expect, it } from "vitest";
import { moveId } from "@/lib/reorder";

describe("moveId", () => {
    const ids = ["a", "b", "c"];

    it("menukar dengan tetangga ke atas dan ke bawah", () => {
        expect(moveId(ids, "b", "up")).toEqual(["b", "a", "c"]);
        expect(moveId(ids, "b", "down")).toEqual(["a", "c", "b"]);
    });

    it("tidak mengubah apa pun di ujung daftar", () => {
        expect(moveId(ids, "a", "up")).toEqual(["a", "b", "c"]);
        expect(moveId(ids, "c", "down")).toEqual(["a", "b", "c"]);
    });

    it("mengembalikan null kalau id tidak ada", () => {
        expect(moveId(ids, "x", "up")).toBeNull();
    });

    it("tidak mengubah array asli", () => {
        const original = ["a", "b"];
        moveId(original, "a", "down");
        expect(original).toEqual(["a", "b"]);
    });
});
