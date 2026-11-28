import { describe, expect, it } from "vitest";
import { parseHeroTitle, stripHeroMarkers } from "@/lib/hero-title";

const show = (text: string) =>
    parseHeroTitle(text)
        .map((t) => `${t.glue ? "~" : ""}${t.kind[0]}:${t.text}`)
        .join(" | ");

describe("parseHeroTitle", () => {
    it("mengubah penanda menjadi gradasi per kata dan garis bawah satu kesatuan", () => {
        expect(
            show(
                "Informatics student building [[web apps]] and {{ML models.}}",
            ),
        ).toBe(
            "p:Informatics | p:student | p:building | g:web | g:apps | p:and | u:ML models.",
        );
    });

    it("tanda baca yang menempel pada penanda tidak diberi spasi", () => {
        expect(show("Hi [[there]], friend")).toBe(
            "p:Hi | g:there | ~p:, | p:friend",
        );
        expect(show("[[a]][[b]]")).toBe("g:a | ~g:b");
    });

    it("judul tanpa penanda dan judul kosong aman", () => {
        expect(show("Plain title only")).toBe("p:Plain | p:title | p:only");
        expect(show("")).toBe("");
    });

    it("penanda yang tidak lengkap dibiarkan sebagai teks biasa", () => {
        expect(show("Broken [[open and {{ok}}")).toBe(
            "p:Broken | p:[[open | p:and | u:ok",
        );
    });
});

describe("stripHeroMarkers", () => {
    it("membuang penanda dan merapikan spasi", () => {
        expect(
            stripHeroMarkers(
                "Informatics student building [[web apps]] and {{ML models.}}",
            ),
        ).toBe("Informatics student building web apps and ML models.");
    });
});
