"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { saveProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/media-picker";
import type { ActionResult } from "@/lib/action-result";
import type { ProfileValues } from "@/lib/validators/profile";
import type { MediaItem } from "@/lib/media-rules";

type FieldProps = {
    name: string;
    label: string;
    value: string;
    error?: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    hint?: string;
    max?: number;
    multiline?: boolean;
    rows?: number;
    required?: boolean;
    type?: string;
};

function Field({
    name,
    label,
    value,
    error,
    onChange,
    hint,
    max,
    multiline,
    rows = 3,
    required,
    type = "text",
}: FieldProps) {
    const errorId = `${name}-error`;
    const hintId = `${name}-hint`;
    const hasHint = Boolean(hint) || max !== undefined;
    const describedBy =
        [error ? errorId : null, hasHint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined;

    const common = {
        id: name,
        name,
        value,
        onChange,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
    };

    return (
        <div className="space-y-1.5">
            <Label htmlFor={name}>
                {label}
                {required && (
                    <span aria-hidden="true" className="text-primary">
                        {" "}
                        *
                    </span>
                )}
            </Label>
            {multiline ? (
                <Textarea rows={rows} className="text-base" {...common} />
            ) : (
                <Input type={type} className="h-11 text-base" {...common} />
            )}
            {error && (
                <p id={errorId} className="text-destructive text-sm">
                    {error}
                </p>
            )}
            {hasHint && (
                <p
                    id={hintId}
                    className="text-muted-foreground flex justify-between gap-4 text-sm"
                >
                    <span>{hint}</span>
                    {max !== undefined && (
                        <span
                            className={
                                value.length > max ? "text-destructive" : ""
                            }
                        >
                            {value.length}/{max}
                        </span>
                    )}
                </p>
            )}
        </div>
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="bg-card grid gap-5 rounded-xl border p-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
            <div>
                <h2 className="font-sans text-base font-semibold">{title}</h2>
                {description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                        {description}
                    </p>
                )}
            </div>
            <div className="space-y-5">{children}</div>
        </section>
    );
}

export function ProfileForm({
    initial,
    media,
}: {
    initial: ProfileValues;
    media: MediaItem[];
}) {
    const [state, formAction, pending] = useActionState<
        ActionResult | undefined,
        FormData
    >(saveProfileAction, undefined);

    // Nilai disimpan di state agar tidak terhapus saat validasi gagal
    const [values, setValues] = useState<ProfileValues>(initial);
    // Mencatat hasil mana yang sudah diedit setelahnya, untuk menyembunyikan "Tersimpan"
    const [editedAfter, setEditedAfter] = useState<ActionResult | undefined>();

    const error = state && !state.ok ? state.error : null;
    const saved = state?.ok === true && editedAfter !== state;

    useEffect(() => {
        if (!state || state.ok || !state.error.fields) return;
        const first = Object.keys(state.error.fields).find(
            (key) => state.error.fields?.[key]?.length,
        );
        if (first) document.getElementById(first)?.focus();
    }, [state]);

    const bind = (name: keyof ProfileValues) => ({
        name,
        value: values[name],
        error: error?.fields?.[name]?.[0],
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValues((v) => ({ ...v, [name]: e.target.value }));
            setEditedAfter(state);
        },
    });

    const setMedia =
        (name: "avatarMediaId" | "cvMediaId" | "ogImageMediaId") =>
        (id: string | null) => {
            setValues((v) => ({ ...v, [name]: id ?? "" }));
            setEditedAfter(state);
        };
    const images = media.filter((m) => m.kind === "image");
    const pdfs = media.filter((m) => m.kind === "pdf");

    return (
        <form action={formAction} className="space-y-6" noValidate>
            <Section title="Identitas">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="Nama lengkap"
                        required
                        {...bind("fullName")}
                    />
                    <Field
                        label="Nama pendek"
                        required
                        hint="Dipakai di logo navbar."
                        {...bind("shortName")}
                    />
                </div>
                <Field
                    label="Teks ketersediaan"
                    hint="Contoh: Terbuka untuk magang dan kolaborasi. Kosongkan untuk menyembunyikan."
                    {...bind("availabilityText")}
                />
            </Section>

            <Section
                title="Hero"
                description="Bagian pertama yang dilihat pengunjung."
            >
                <Field
                    label="Judul hero"
                    required
                    multiline
                    rows={2}
                    max={200}
                    {...bind("heroTitle")}
                />
                <Field
                    label="Ringkasan hero"
                    required
                    multiline
                    max={500}
                    {...bind("heroSummary")}
                />
            </Section>

            <Section title="Tentang">
                <Field
                    label="Kalimat pembuka"
                    multiline
                    rows={2}
                    max={300}
                    {...bind("aboutLead")}
                />
                <Field
                    label="Isi tentang"
                    multiline
                    rows={8}
                    max={8000}
                    hint="Boleh memakai Markdown. Pratinjau menyusul."
                    {...bind("aboutBodyMd")}
                />
            </Section>

            <Section title="Kontak dan info">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Kampus" {...bind("university")} />
                    <Field label="Lokasi" {...bind("location")} />
                </div>
                <Field
                    label="Email publik"
                    type="email"
                    hint="Ditampilkan di halaman kontak."
                    {...bind("publicEmail")}
                />
                <Field
                    label="Judul kontak"
                    max={200}
                    {...bind("contactHeading")}
                />
                <Field label="Teks footer" max={200} {...bind("footerText")} />
            </Section>

            <Section
                title="Gambar dan berkas"
                description="Dipilih dari perpustakaan Media atau diunggah langsung dari sini."
            >
                <MediaPicker
                    name="avatarMediaId"
                    label="Foto profil"
                    kind="image"
                    valueId={values.avatarMediaId}
                    items={images}
                    onChange={setMedia("avatarMediaId")}
                    error={error?.fields?.avatarMediaId?.[0]}
                />
                <MediaPicker
                    name="cvMediaId"
                    label="CV (PDF)"
                    kind="pdf"
                    valueId={values.cvMediaId}
                    items={pdfs}
                    onChange={setMedia("cvMediaId")}
                    hint="Dipakai tombol Unduh CV."
                    error={error?.fields?.cvMediaId?.[0]}
                />
                <MediaPicker
                    name="ogImageMediaId"
                    label="Gambar pratinjau tautan (OG)"
                    kind="image"
                    valueId={values.ogImageMediaId}
                    items={images}
                    onChange={setMedia("ogImageMediaId")}
                    hint="Tampil saat tautan situs dibagikan. Disarankan rasio 1200×630."
                    error={error?.fields?.ogImageMediaId?.[0]}
                />
            </Section>

            <Section
                title="SEO"
                description="Dipakai mesin pencari dan pratinjau tautan. Kosong berarti memakai nilai bawaan."
            >
                <Field label="Judul SEO" max={70} {...bind("seoTitle")} />
                <Field
                    label="Deskripsi SEO"
                    multiline
                    rows={3}
                    max={160}
                    {...bind("seoDescription")}
                />
            </Section>

            <div className="bg-background/90 sticky bottom-0 -mx-1 flex flex-wrap items-center gap-4 border-t px-1 py-4 backdrop-blur">
                <Button type="submit" disabled={pending}>
                    {pending ? "Menyimpan..." : "Simpan perubahan"}
                </Button>
                {saved && (
                    <p role="status" className="text-sm">
                        Tersimpan.
                    </p>
                )}
                {error && (
                    <p role="alert" className="text-destructive text-sm">
                        {error.message}
                    </p>
                )}
            </div>
        </form>
    );
}
