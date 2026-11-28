import { Fragment } from "react";
import { parseHeroTitle } from "@/lib/hero-title";

/** Teks dengan penanda [[gradasi]] dan {{garis bawah}}, tanpa animasi masuk. */
export function MarkedText({ text }: { text: string }) {
    const tokens = parseHeroTitle(text);
    return (
        <>
            {tokens.map((token, i) => (
                <Fragment key={`${token.text}-${i}`}>
                    {i > 0 && !token.glue ? " " : null}
                    {token.kind === "grad" ? (
                        <span className="hero-grad">{token.text}</span>
                    ) : token.kind === "ul" ? (
                        <span className="hero-ul">{token.text}</span>
                    ) : (
                        token.text
                    )}
                </Fragment>
            ))}
        </>
    );
}
