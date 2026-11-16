import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
    it("membersihkan nama teknologi umum", () => {
        expect(slugify("Next.js")).toBe("nextjs");
        expect(slugify("Node.js")).toBe("nodejs");
        expect(slugify("Tailwind CSS")).toBe("tailwind-css");
        expect(slugify("PostgreSQL")).toBe("postgresql");
        expect(slugify("Laravel dan Livewire")).toBe("laravel-dan-livewire");
    });

    it("membedakan C++ dan C#", () => {
        expect(slugify("C++")).toBe("cplusplus");
        expect(slugify("C#")).toBe("csharp");
    });

    it("membuang aksen", () => {
        expect(slugify("Café")).toBe("cafe");
    });

    it("mengembalikan string kosong kalau tidak ada huruf atau angka", () => {
        expect(slugify("!!!")).toBe("");
    });
});
