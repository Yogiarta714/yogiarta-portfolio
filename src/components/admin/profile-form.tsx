"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { saveProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Field, Section } from "@/components/admin/form-kit";
import { MediaPicker } from "@/components/admin/media-picker";
import type { ActionResult } from "@/lib/action-result";
import type { ProfileValues } from "@/lib/validators/profile";
import type { MediaItem } from "@/lib/media-rules";

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

    const dirty = (Object.keys(initial) as (keyof ProfileValues)[]).some(
        (key) => values[key] !== initial[key],
    );

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

            <div className="bg-card/95 border-border/60 sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-3 pl-5 shadow-lg backdrop-blur">
                {error ? (
                    <p role="alert" className="text-destructive text-sm">
                        {error.message}
                    </p>
                ) : (
                    <p role="status" className="text-muted-foreground text-sm">
                        {pending
                            ? "Menyimpan…"
                            : dirty
                              ? "Ada perubahan yang belum disimpan"
                              : saved
                                ? "Tersimpan."
                                : "Belum ada perubahan"}
                    </p>
                )}
                <Button type="submit" disabled={pending || !dirty}>
                    {pending ? "Menyimpan..." : "Simpan perubahan"}
                </Button>
            </div>
        </form>
    );
}
