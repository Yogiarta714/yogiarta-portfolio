import type {
    AchievementRow,
    CertificateRow,
} from "@/lib/admin-queries/credentials";
import type {
    AchievementInput,
    CertificateInput,
} from "@/lib/validators/credentials";

/** Sama bentuknya dengan data yang dikirim ke Server Action: semua isian berupa string. */
export type CertificateFormValues = CertificateInput;
export type AchievementFormValues = AchievementInput;

export function toCertificateValues(
    row: CertificateRow | null,
    today: string,
): CertificateFormValues {
    if (!row) {
        return {
            title: "",
            issuer: "",
            issuedDate: today,
            credentialUrl: "",
            fileMediaId: "",
            isVisible: true,
        };
    }
    return {
        title: row.title,
        issuer: row.issuer,
        issuedDate: row.issuedDate,
        credentialUrl: row.credentialUrl ?? "",
        fileMediaId: row.fileMediaId ?? "",
        isVisible: row.isVisible,
    };
}

export function toAchievementValues(
    row: AchievementRow | null,
    today: string,
): AchievementFormValues {
    if (!row) {
        return {
            title: "",
            organizer: "",
            level: "",
            achievedDate: today,
            description: "",
            proofUrl: "",
            isVisible: true,
        };
    }
    return {
        title: row.title,
        organizer: row.organizer ?? "",
        level: row.level ?? "",
        achievedDate: row.achievedDate,
        description: row.description ?? "",
        proofUrl: row.proofUrl ?? "",
        isVisible: row.isVisible,
    };
}
