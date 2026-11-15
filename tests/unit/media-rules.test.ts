import { describe, expect, it } from "vitest";
import {
    MAX_IMAGE_BYTES,
    MAX_PDF_BYTES,
    PATHNAME_PATTERN,
    buildPathname,
    kindFromMime,
    rulesFor,
    safeBaseName,
} from "@/lib/media-rules";

describe("kindFromMime", () => {
    it("mengenali gambar dan PDF yang diizinkan", () => {
        expect(kindFromMime("image/jpeg")).toBe("image");
        expect(kindFromMime("image/png")).toBe("image");
        expect(kindFromMime("image/webp")).toBe("image");
        expect(kindFromMime("application/pdf")).toBe("pdf");
    });

    it("menolak tipe lain, termasuk SVG dan GIF", () => {
        expect(kindFromMime("image/svg+xml")).toBeNull();
        expect(kindFromMime("image/gif")).toBeNull();
        expect(kindFromMime("text/html")).toBeNull();
    });
});

describe("rulesFor", () => {
    it("memberi batas ukuran sesuai jenis", () => {
        expect(rulesFor("image").maxBytes).toBe(MAX_IMAGE_BYTES);
        expect(rulesFor("pdf").maxBytes).toBe(MAX_PDF_BYTES);
        expect(rulesFor("pdf").allowedTypes).toEqual(["application/pdf"]);
    });
});

describe("safeBaseName", () => {
    it("membersihkan spasi, simbol, dan ekstensi", () => {
        expect(safeBaseName("Foto Profil (Baru)!.JPG")).toBe(
            "foto-profil-baru",
        );
    });

    it("memberi nama cadangan kalau hasilnya kosong", () => {
        expect(safeBaseName("###.png")).toBe("file");
    });

    it("membatasi panjang nama", () => {
        expect(
            safeBaseName("a".repeat(100) + ".png").length,
        ).toBeLessThanOrEqual(40);
    });
});

describe("buildPathname", () => {
    it("menaruh gambar di images/ dan PDF di documents/", () => {
        expect(buildPathname("image", "Foto Saya.png", "image/webp")).toBe(
            "images/foto-saya.webp",
        );
        expect(buildPathname("pdf", "CV Yogi.pdf", "application/pdf")).toBe(
            "documents/cv-yogi.pdf",
        );
    });

    it("selalu menghasilkan path yang lolos PATHNAME_PATTERN", () => {
        for (const name of [
            "a.png",
            "Nama Aneh!!.jpeg",
            "日本語.webp",
            ".png",
        ]) {
            expect(
                PATHNAME_PATTERN.test(
                    buildPathname("image", name, "image/png"),
                ),
            ).toBe(true);
        }
    });
});

describe("PATHNAME_PATTERN", () => {
    it("menolak path berbahaya", () => {
        expect(PATHNAME_PATTERN.test("../etc/passwd.png")).toBe(false);
        expect(PATHNAME_PATTERN.test("images/../x.png")).toBe(false);
        expect(PATHNAME_PATTERN.test("other/file.png")).toBe(false);
        expect(PATHNAME_PATTERN.test("images/file.html")).toBe(false);
    });

    it("menerima nama dengan akhiran acak dari Blob", () => {
        expect(PATHNAME_PATTERN.test("images/foto-Ab3dE9xYz.webp")).toBe(true);
    });
});
