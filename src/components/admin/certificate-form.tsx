"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
    createCertificateAction,
    updateCertificateAction,
} from "@/actions/credentials";
import { Field } from "@/components/admin/form-kit";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import type { CertificateFormValues } from "@/lib/credentials-form";
import type { MediaItem } from "@/lib/media-rules";

type TextKey = "title" | "issuer" | "issuedDate" | "credentialUrl";

export function CertificateForm({
    id,
    initial,
    library,
    onDone,
}: {
    id: string | null;
    initial: CertificateFormValues;
    library: MediaItem[];
    onDone: () => void;
}) {
    const [values, setValues] = useState<CertificateFormValues>(initial);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof CertificateFormValues>(
        key: K,
        value: CertificateFormValues[K],
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
            const result = id
                ? await updateCertificateAction(id, values)
                : await createCertificateAction(values);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            onDone();
        });
    }

    return (
        <form onSubmit={submit} className="space-y-5" noValidate>
            <Field label="Judul sertifikat" required {...text("title")} />
            <Field
                label="Penerbit"
                required
                hint="Contoh: Dicoding, Coursera, Universitas Udayana."
                {...text("issuer")}
            />
            <Field
                label="Tanggal terbit"
                required
                type="date"
                {...text("issuedDate")}
            />
            <Field
                label="Tautan kredensial"
                type="url"
                hint="Opsional. Tautan untuk memverifikasi sertifikat di situs penerbit."
                {...text("credentialUrl")}
            />

            <MediaPicker
                name="fileMediaId"
                label="File sertifikat"
                kind="pdf"
                valueId={values.fileMediaId}
                items={library}
                onChange={(mediaId) => set("fileMediaId", mediaId ?? "")}
                hint="Opsional. Pilih PDF atau gambar yang sudah ada. Untuk mengunggah gambar, unggah dulu di halaman Media."
                error={err("fileMediaId")}
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
