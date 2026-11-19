"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { saveProjectAction } from "@/actions/projects";
import { Field, Section, SelectField } from "@/components/admin/form-kit";
import { GalleryEditor } from "@/components/admin/gallery-editor";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import type { CategoryRow, TechnologyRow } from "@/lib/admin-queries/skills";
import type { MediaItem } from "@/lib/media-rules";
import { toActionInput, type ProjectFormValues } from "@/lib/project-form";
import type { ProjectStatus } from "@/lib/project-publish";
import { slugify } from "@/lib/slug";

type TextKey =
    | "title"
    | "slug"
    | "summary"
    | "descriptionMd"
    | "category"
    | "projectDate"
    | "role"
    | "githubUrl"
    | "demoUrl";

function TechnologyPicker({
    categories,
    technologies,
    selected,
    onChange,
    error,
}: {
    categories: CategoryRow[];
    technologies: TechnologyRow[];
    selected: string[];
    onChange: (ids: string[]) => void;
    error?: string;
}) {
    const byCategory = new Map<string | null, TechnologyRow[]>();
    for (const tech of technologies) {
        const list = byCategory.get(tech.categoryId) ?? [];
        list.push(tech);
        byCategory.set(tech.categoryId, list);
    }
    const groups = [
        ...categories.map((c) => ({
            key: c.id,
            title: c.name,
            items: byCategory.get(c.id) ?? [],
        })),
        {
            key: "none",
            title: "Tanpa kategori",
            items: byCategory.get(null) ?? [],
        },
    ].filter((g) => g.items.length > 0);

    function toggle(id: string) {
        onChange(
            selected.includes(id)
                ? selected.filter((x) => x !== id)
                : [...selected, id],
        );
    }

    return (
        <div
            id="technologyIds"
            tabIndex={-1}
            className="space-y-4 outline-none"
        >
            {groups.length === 0 && (
                <p className="text-muted-foreground text-sm">
                    Belum ada teknologi. Tambahkan dulu di halaman Skills dan
                    teknologi.
                </p>
            )}
            {groups.map((group) => (
                <fieldset key={group.key} className="space-y-2">
                    <legend className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
                        {group.title}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                        {group.items.map((tech) => (
                            <label
                                key={tech.id}
                                className="has-checked:border-primary has-checked:bg-primary/10 border-border flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                            >
                                <input
                                    type="checkbox"
                                    className="accent-primary size-4"
                                    checked={selected.includes(tech.id)}
                                    onChange={() => toggle(tech.id)}
                                />
                                {tech.name}
                            </label>
                        ))}
                    </div>
                </fieldset>
            ))}
            <p className="text-muted-foreground text-sm">
                {selected.length} dipilih
            </p>
            {error && <p className="text-destructive text-sm">{error}</p>}
        </div>
    );
}

export function ProjectForm({
    mode,
    projectId,
    initial,
    categories,
    technologies,
    library,
    categorySuggestions,
}: {
    mode: "new" | "edit";
    projectId: string | null;
    initial: ProjectFormValues;
    categories: CategoryRow[];
    technologies: TechnologyRow[];
    library: MediaItem[];
    categorySuggestions: string[];
}) {
    const router = useRouter();
    const [values, setValues] = useState<ProjectFormValues>(initial);
    const [slugTouched, setSlugTouched] = useState(mode === "edit");
    const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
    const [justSaved, setJustSaved] = useState(false);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const json = JSON.stringify(values);
    const dirty = json !== savedJson;
    const images = library.filter((m) => m.kind === "image");
    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof ProjectFormValues>(
        key: K,
        value: ProjectFormValues[K],
    ) {
        setValues((v) => ({ ...v, [key]: value }));
        setJustSaved(false);
    }

    const text = (key: TextKey) => ({
        name: key,
        value: values[key],
        error: err(key),
        onChange: (e: { target: { value: string } }) =>
            set(key, e.target.value),
    });

    // Peringatan bawaan browser kalau ada perubahan yang belum disimpan.
    useEffect(() => {
        if (!dirty) return;
        const handler = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    // Setelah gagal, pindahkan fokus ke isian pertama yang bermasalah.
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
        setJustSaved(false);
        const snapshot = json;
        startTransition(async () => {
            const result = await saveProjectAction(
                projectId,
                toActionInput(values),
            );
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setSavedJson(snapshot);
            setJustSaved(true);
            if (mode === "new")
                router.replace(`/admin/projects/${result.data.id}`);
        });
    }

    const slugChanged = mode === "edit" && values.slug !== initial.slug;

    return (
        <form onSubmit={submit} className="space-y-6" noValidate>
            <Section title="Informasi dasar">
                <Field
                    label="Judul"
                    required
                    {...text("title")}
                    onChange={(e) => {
                        const title = e.target.value;
                        setValues((v) => ({
                            ...v,
                            title,
                            ...(slugTouched ? {} : { slug: slugify(title) }),
                        }));
                        setJustSaved(false);
                    }}
                />
                <Field
                    label="Slug"
                    required
                    hint={
                        slugChanged && initial.status === "published"
                            ? "Peringatan: mengubah slug proyek yang sudah terbit mengubah alamatnya."
                            : `Alamat di situs: /projects/${values.slug || "slug-proyek"}`
                    }
                    {...text("slug")}
                    onChange={(e) => {
                        setSlugTouched(true);
                        set("slug", e.target.value);
                    }}
                />
                <Field
                    label="Ringkasan"
                    required
                    multiline
                    rows={3}
                    max={300}
                    {...text("summary")}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <Field
                            label="Kategori"
                            required
                            list="project-categories"
                            hint="Ketik bebas, atau pilih dari saran."
                            {...text("category")}
                        />
                        <datalist id="project-categories">
                            {categorySuggestions.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </div>
                    <Field
                        label="Tanggal proyek"
                        required
                        type="date"
                        {...text("projectDate")}
                    />
                </div>
                <Field
                    label="Peran"
                    hint="Contoh: Pengembang full-stack."
                    {...text("role")}
                />
            </Section>

            <Section
                title="Thumbnail"
                description="Gambar utama proyek di kartu dan di bagian atas halaman detail."
            >
                <MediaPicker
                    name="thumbnailMediaId"
                    label="Thumbnail"
                    kind="image"
                    valueId={values.thumbnailMediaId}
                    items={images}
                    onChange={(id) => set("thumbnailMediaId", id ?? "")}
                    hint="Wajib diisi sebelum proyek bisa diterbitkan."
                    error={err("thumbnailMediaId")}
                />
            </Section>

            <Section title="Deskripsi">
                <Field
                    label="Deskripsi lengkap"
                    multiline
                    rows={12}
                    max={20000}
                    hint="Boleh memakai Markdown. Pratinjau menyusul."
                    {...text("descriptionMd")}
                />
            </Section>

            <Section title="Tautan">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="GitHub"
                        type="url"
                        hint="Kosongkan kalau tidak ada."
                        {...text("githubUrl")}
                    />
                    <Field
                        label="Demo"
                        type="url"
                        hint="Kosongkan kalau tidak ada."
                        {...text("demoUrl")}
                    />
                </div>
            </Section>

            <Section
                title="Teknologi"
                description="Yang dipakai di proyek ini. Daftar diatur di Skills dan teknologi."
            >
                <TechnologyPicker
                    categories={categories}
                    technologies={technologies}
                    selected={values.technologyIds}
                    onChange={(ids) => set("technologyIds", ids)}
                    error={err("technologyIds")}
                />
            </Section>

            <Section
                title="Galeri"
                description="Gambar tambahan yang tampil di halaman detail, sesuai urutan di sini."
            >
                <div id="gallery" tabIndex={-1} className="outline-none">
                    <GalleryEditor
                        entries={values.gallery}
                        library={library}
                        onChange={(entries) => set("gallery", entries)}
                        error={err("gallery")}
                    />
                </div>
            </Section>

            <Section title="Publikasi">
                <SelectField
                    name="status"
                    label="Status"
                    value={values.status}
                    onChange={(e) =>
                        set("status", e.target.value as ProjectStatus)
                    }
                    options={[
                        {
                            value: "draft",
                            label: "Draft (belum tampil di situs)",
                        },
                        {
                            value: "published",
                            label: "Terbit (tampil di situs)",
                        },
                    ]}
                    hint="Proyek terbit wajib punya thumbnail."
                    error={err("status")}
                />
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        className="accent-primary size-4"
                        checked={values.isFeatured}
                        onChange={(e) => set("isFeatured", e.target.checked)}
                    />
                    Tampilkan sebagai proyek unggulan
                </label>
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
                                : justSaved
                                    ? "Tersimpan."
                                    : "Belum ada perubahan"}
                    </p>
                )}
                <Button type="submit" disabled={pending || !dirty}>
                    {pending
                        ? "Menyimpan..."
                        : mode === "new"
                            ? "Buat proyek"
                            : "Simpan perubahan"}
                </Button>
            </div>
        </form>
    );
}
