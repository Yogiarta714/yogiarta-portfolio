"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createEducationAction, updateEducationAction } from "@/actions/career";
import { Field } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import { toEducationInput, type EducationFormValues } from "@/lib/career-form";

type TextKey =
    | "institution"
    | "degree"
    | "field"
    | "startYear"
    | "endYear"
    | "descriptionMd";

export function EducationForm({
    id,
    initial,
    onDone,
}: {
    id: string | null;
    initial: EducationFormValues;
    onDone: () => void;
}) {
    const [values, setValues] = useState<EducationFormValues>(initial);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof EducationFormValues>(
        key: K,
        value: EducationFormValues[K],
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
            const input = toEducationInput(values);
            const result = id
                ? await updateEducationAction(id, input)
                : await createEducationAction(input);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            onDone();
        });
    }

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Institusi" required {...text("institution")} />
            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Jenjang"
                    required
                    hint="Contoh: S1, D3, SMA."
                    {...text("degree")}
                />
                <Field label="Program studi" required {...text("field")} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Tahun mulai"
                    required
                    hint="4 digit, contoh: 2023."
                    {...text("startYear")}
                />
                {!values.ongoing && (
                    <Field
                        label="Tahun selesai"
                        hint="4 digit."
                        {...text("endYear")}
                    />
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
                rows={4}
                max={3000}
                hint="Opsional. Boleh memakai Markdown."
                {...text("descriptionMd")}
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
