"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
    createAchievementAction,
    updateAchievementAction,
} from "@/actions/credentials";
import { Field } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import type { AchievementFormValues } from "@/lib/credentials-form";

type TextKey =
    | "title"
    | "organizer"
    | "level"
    | "achievedDate"
    | "description"
    | "proofUrl";

const LEVEL_SUGGESTIONS = [
    "Kampus",
    "Kota atau kabupaten",
    "Provinsi",
    "Nasional",
    "Internasional",
];

export function AchievementForm({
    id,
    initial,
    onDone,
}: {
    id: string | null;
    initial: AchievementFormValues;
    onDone: () => void;
}) {
    const [values, setValues] = useState<AchievementFormValues>(initial);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof AchievementFormValues>(
        key: K,
        value: AchievementFormValues[K],
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
            const result = id
                ? await updateAchievementAction(id, values)
                : await createAchievementAction(values);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            onDone();
        });
    }

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Judul prestasi" required {...text("title")} />
            <Field
                label="Penyelenggara"
                hint="Opsional. Contoh: Kementerian, kampus, atau komunitas."
                {...text("organizer")}
            />
            <div className="grid gap-5 sm:grid-cols-2">
                <div>
                    <Field
                        label="Tingkat"
                        list="achievement-levels"
                        hint="Opsional. Ketik bebas, atau pilih dari saran."
                        {...text("level")}
                    />
                    <datalist id="achievement-levels">
                        {LEVEL_SUGGESTIONS.map((level) => (
                            <option key={level} value={level} />
                        ))}
                    </datalist>
                </div>
                <Field
                    label="Tanggal"
                    required
                    type="date"
                    {...text("achievedDate")}
                />
            </div>
            <Field
                label="Deskripsi"
                multiline
                rows={4}
                max={2000}
                hint="Opsional. Ceritakan singkat apa yang dicapai."
                {...text("description")}
            />
            <Field
                label="Tautan bukti"
                type="url"
                hint="Opsional. Berita, pengumuman, atau halaman hasil lomba."
                {...text("proofUrl")}
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
