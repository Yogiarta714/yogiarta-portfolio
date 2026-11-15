import type { Metadata } from "next";
import {
    Bricolage_Grotesque,
    Instrument_Sans,
    JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
    variable: "--font-bricolage",
    subsets: ["latin"],
    display: "swap",
});

const instrumentSans = Instrument_Sans({
    variable: "--font-instrument-sans",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Portfolio",
    description: "Portfolio pribadi.",
};

// Dijalankan sebelum halaman
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="id"
            suppressHydrationWarning
            className={`${bricolage.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
