import type { EducationRow, ExperienceRow } from "@/lib/admin-queries/career";
import type { EducationInput, ExperienceInput } from "@/lib/validators/career";

export type ExperienceFormValues = {
    kind: ExperienceInput["kind"];
    organization: string;
    roleTitle: string;
    location: string;
    startDate: string;
    endDate: string;
    /** Hanya untuk tampilan: centang "Masih berlangsung" mengosongkan tanggal selesai. */
    ongoing: boolean;
    descriptionMd: string;
    url: string;
    isVisible: boolean;
};

export type EducationFormValues = {
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
    ongoing: boolean;
    descriptionMd: string;
    isVisible: boolean;
};

/** Nilai awal form pengalaman: dari data yang ada, atau kosong untuk yang baru. */
export function toExperienceValues(
    row: ExperienceRow | null,
    today: string,
): ExperienceFormValues {
    if (!row) {
        return {
            kind: "organization",
            organization: "",
            roleTitle: "",
            location: "",
            startDate: today,
            endDate: today,
            ongoing: true,
            descriptionMd: "",
            url: "",
            isVisible: true,
        };
    }
    return {
        kind: row.kind,
        organization: row.organization,
        roleTitle: row.roleTitle,
        location: row.location ?? "",
        startDate: row.startDate,
        endDate: row.endDate ?? today,
        ongoing: row.endDate === null,
        descriptionMd: row.descriptionMd ?? "",
        url: row.url ?? "",
        isVisible: row.isVisible,
    };
}

/** Data yang dikirim ke Server Action: "masih berlangsung" berarti tanggal selesai kosong. */
export function toExperienceInput(
    values: ExperienceFormValues,
): ExperienceInput {
    const { ongoing, endDate, ...rest } = values;
    return { ...rest, endDate: ongoing ? "" : endDate };
}

export function toEducationValues(
    row: EducationRow | null,
    today: string,
): EducationFormValues {
    const thisYear = today.slice(0, 4);
    if (!row) {
        return {
            institution: "",
            degree: "",
            field: "",
            startYear: thisYear,
            endYear: thisYear,
            ongoing: true,
            descriptionMd: "",
            isVisible: true,
        };
    }
    return {
        institution: row.institution,
        degree: row.degree,
        field: row.field,
        startYear: String(row.startYear),
        endYear: row.endYear === null ? thisYear : String(row.endYear),
        ongoing: row.endYear === null,
        descriptionMd: row.descriptionMd ?? "",
        isVisible: row.isVisible,
    };
}

export function toEducationInput(values: EducationFormValues): EducationInput {
    const { ongoing, endYear, ...rest } = values;
    return { ...rest, endYear: ongoing ? "" : endYear };
}
