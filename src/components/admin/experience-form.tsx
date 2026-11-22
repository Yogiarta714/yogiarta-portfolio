"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
    createExperienceAction,
    updateExperienceAction,
} from "@/actions/career";
import { Field, SelectField } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import {
    toExperienceInput,
    type ExperienceFormValues,
} from "@/lib/career-form";

type TextKey =
    | "organization"
    | "roleTitle"
    | "location"
    | "startDate"
    | "endDate"
    | "descriptionMd"
    | "url";

const KIND_OPTIONS = [
    { value: "work", label: "Pekerjaan" },
    { value: "organization", label: "Organisasi atau kepanitiaan" },
    { value: "volunteer", label: "Relawan" },
];

export function ExperienceForm({
    id,
    initial,
    onDone,
}: {
    id: string | null;
    initial: ExperienceFormValues;
    onDone: () => void;
}) {
    const [values, setValues] = useState<ExperienceFormValues>(initial);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof ExperienceFormValues>(
        key: K,
        value: ExperienceFormValues[K],
    ) {
        setValues((v) => ({ ...v, [key]: value }));
    }

    const text = (key: TextKey) => ({
        name: key,
        value: values[key],
        error: err(key),
        onChange: (e: { target: { value: string } }) =>
            set(key, e.target.value),
    });

    // Setelah gagal, pindahkan fokus ke isian pertama yang bermasalah
    useEffect(() => {
        if (!error?.fields) return;
        const first = Object.keys(error.fields).find(
            (k) => error.fields?.[k]?.length,
        );
        if (first) document.getElementById(first)?.focus();
    }, [error]);

    function submit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const input = toExperienceInput(values);
            const result = id
                ? await updateExperienceAction(id, input)
                : await createExperienceAction(input);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            onDone();
        });
    }

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <SelectField
                name="kind"
                label="Jenis"
                value={values.kind}
                onChange={(e) =>
                    set("kind", e.target.value as ExperienceFormValues["kind"])
                }
                options={KIND_OPTIONS}
                error={err("kind")}
            />
            <Field
                label="Organisasi atau perusahaan"
                required
                {...text("organization")}
            />
            <Field label="Jabatan" required {...text("roleTitle")} />
            <Field
                label="Lokasi"
                hint="Opsional. Contoh: Denpasar, Bali."
                {...text("location")}
            />

            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Mulai"
                    required
                    type="date"
                    {...text("startDate")}
                />
                {!values.ongoing && (
                    <Field label="Selesai" type="date" {...text("endDate")} />
                )}
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={values.ongoing}
                    onChange={(e) => set("ongoing", e.target.checked)}
                />
                Masih berlangsung
            </label>

            <Field
                label="Deskripsi"
                multiline
                rows={5}
                max={5000}
                hint="Opsional. Boleh memakai Markdown, misalnya poin dengan tanda -."
                {...text("descriptionMd")}
            />
            <Field
                label="Tautan"
                type="url"
                hint="Opsional. Situs organisasi atau bukti kegiatan."
                {...text("url")}
            />
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={values.isVisible}
                    onChange={(e) => set("isVisible", e.target.checked)}
                />
                Tampilkan di situs
            </label>

            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error.message}
                </p>
            )}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    disabled={pending}
                    onClick={onDone}
                >
                    Batal
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending ? "Menyimpan..." : "Simpan"}
                </Button>
            </div>
        </form>
    );
}
