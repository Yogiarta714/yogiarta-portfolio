import { z } from "zod";
import { isHttpUrl, requiredText } from "@/lib/validators/fields";

export const SOCIAL_PLATFORMS = [
    { value: "github", label: "GitHub" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
    { value: "email", label: "Email" },
    { value: "x", label: "X" },
    { value: "youtube", label: "YouTube" },
    { value: "other", label: "Lainnya" },
] as const;

const PLATFORM_VALUES = SOCIAL_PLATFORMS.map((p) => p.value) as [
    string,
    ...string[],
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isMailto(value: string): boolean {
    return (
        value.startsWith("mailto:") && EMAIL.test(value.slice("mailto:".length))
    );
}

export const socialLinkInputSchema = z.object({
    platform: z.enum(PLATFORM_VALUES, { message: "Platform tidak valid" }),
    label: requiredText("Teks tampilan", 60),
    url: z
        .string()
        .trim()
        .min(1, "Tautan wajib diisi")
        .max(300, "Tautan maksimal 300 karakter")
        .refine(
            (v) => isHttpUrl(v) || isMailto(v),
            "Gunakan tautan http, https, atau mailto:alamat@email.com",
        ),
    isVisible: z.boolean(),
});

export type SocialLinkInput = z.input<typeof socialLinkInputSchema>;
export type SocialLinkData = z.output<typeof socialLinkInputSchema>;
