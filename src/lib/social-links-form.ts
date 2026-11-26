import type { SocialLinkRow } from "@/lib/admin-queries/social-links";
import type { SocialLinkInput } from "@/lib/validators/social-links";

export type SocialLinkFormValues = SocialLinkInput;

export function toSocialLinkValues(
    row: SocialLinkRow | null,
): SocialLinkFormValues {
    if (!row)
        return { platform: "github", label: "", url: "", isVisible: true };
    return {
        platform: row.platform,
        label: row.label,
        url: row.url,
        isVisible: row.isVisible,
    };
}
