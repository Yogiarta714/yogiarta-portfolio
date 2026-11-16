"use client";

import { useId, useState } from "react";
import {
    createCategoryAction,
    createTechnologyAction,
    deleteCategoryAction,
    deleteTechnologyAction,
    moveCategoryAction,
    moveTechnologyAction,
    renameCategoryAction,
    updateTechnologyAction,
} from "@/actions/skills";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { Field, Section, SelectField } from "@/components/admin/form-kit";
import { useAction } from "@/components/admin/use-action";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import type { CategoryRow, TechnologyRow } from "@/lib/admin-queries/skills";

type Direction = "up" | "down";

const rowClass =
    "border-border/60 bg-background/40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-3";

/* ------------------------------ Tombol urutan ------------------------------ */

function MoveButtons({
    name,
    canUp,
    canDown,
    onMove,
}: {
    name: string;
    canUp: boolean;
    canDown: boolean;
    onMove: (direction: Direction) => Promise<ActionResult>;
}) {
    const { pending, error, run } = useAction();
    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canUp || pending}
                aria-label={`Naikkan ${name}`}
                onClick={() => run(() => onMove("up"))}
            >
                ↑
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!canDown || pending}
                aria-label={`Turunkan ${name}`}
                onClick={() => run(() => onMove("down"))}
            >
                ↓
            </Button>
            {error && (
                <span role="alert" className="text-destructive text-sm">
                    {error}
                </span>
            )}
        </div>
    );
}

/* -------------------------------- Kategori -------------------------------- */

function CategoryForm({
    label,
    initialName = "",
    submitLabel,
    onSubmit,
    onDone,
    onCancel,
    resetOnSuccess,
}: {
    label: string;
    initialName?: string;
    submitLabel: string;
    onSubmit: (input: { name: string }) => Promise<ActionResult>;
    onDone?: () => void;
    onCancel?: () => void;
    resetOnSuccess?: boolean;
}) {
    const uid = useId();
    const [name, setName] = useState(initialName);
    const { pending, error, run } = useAction();

    return (
        <form
            noValidate
            className="space-y-2"
            onSubmit={(e) => {
                e.preventDefault();
                run(
                    () => onSubmit({ name }),
                    () => {
                        if (resetOnSuccess) setName("");
                        onDone?.();
                    },
                );
            }}
        >
            <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                    <Field
                        name={`${uid}-name`}
                        label={label}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={pending}>
                    {pending ? "Menyimpan…" : submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending}
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                )}
            </div>
            {error && (
                <p role="alert" className="text-destructive text-sm">
                    {error}
                </p>
            )}
        </form>
    );
}

function CategoryItem({
    category,
    techCount,
    canUp,
    canDown,
}: {
    category: CategoryRow;
    techCount: number;
    canUp: boolean;
    canDown: boolean;
}) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <li className="border-border/60 bg-background/40 rounded-xl border p-4">
                <CategoryForm
                    label="Nama kategori"
                    initialName={category.name}
                    submitLabel="Simpan"
                    onSubmit={(input) =>
                        renameCategoryAction(category.id, input)
                    }
                    onDone={() => setEditing(false)}
                    onCancel={() => setEditing(false)}
                />
            </li>
        );
    }

    return (
        <li className={rowClass}>
            <div className="min-w-0">
                <p className="font-medium">{category.name}</p>
                <p className="text-muted-foreground text-sm">
                    {techCount} teknologi
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <MoveButtons
                    name={category.name}
                    canUp={canUp}
                    canDown={canDown}
                    onMove={(d) => moveCategoryAction(category.id, d)}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Ubah ${category.name}`}
                    onClick={() => setEditing(true)}
                >
                    Ubah
                </Button>
                <ConfirmDelete
                    name={category.name}
                    prompt={
                        techCount > 0
                            ? `Hapus kategori? ${techCount} teknologi menjadi tanpa kategori.`
                            : "Hapus kategori ini?"
                    }
                    action={() => deleteCategoryAction(category.id)}
                />
            </div>
        </li>
    );
}

/* -------------------------------- Teknologi -------------------------------- */

type TechValues = { name: string; categoryId: string; showInSkills: boolean };

function TechnologyForm({
    initial,
    categories,
    submitLabel,
    onSubmit,
    onDone,
    onCancel,
    resetOnSuccess,
}: {
    initial: TechValues;
    categories: CategoryRow[];
    submitLabel: string;
    onSubmit: (input: {
        name: string;
        categoryId: string | null;
        showInSkills: boolean;
    }) => Promise<ActionResult>;
    onDone?: () => void;
    onCancel?: () => void;
    resetOnSuccess?: boolean;
}) {
    const uid = useId();
    const [values, setValues] = useState<TechValues>(initial);
    const { pending, error, run } = useAction();

    const options = [
        { value: "", label: "Tanpa kategori" },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    return (
        <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                run(
                    () =>
                        onSubmit({
                            name: values.name,
                            categoryId: values.categoryId || null,
                            showInSkills: values.showInSkills,
                        }),
                    () => {
                        // Kategori dibiarkan, supaya beberapa teknologi berurutan mudah ditambahkan.
                        if (resetOnSuccess)
                            setValues((v) => ({ ...v, name: "" }));
                        onDone?.();
                    },
                );
            }}
        >
            <div className="grid gap-4 sm:grid-cols-2">
                <Field
                    name={`${uid}-name`}
                    label="Nama teknologi"
                    value={values.name}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, name: e.target.value }))
                    }
                />
                <SelectField
                    name={`${uid}-category`}
                    label="Kategori"
                    value={values.categoryId}
                    onChange={(e) =>
                        setValues((v) => ({ ...v, categoryId: e.target.value }))
                    }
                    options={options}
                />
            </div>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={values.showInSkills}
                    onChange={(e) =>
                        setValues((v) => ({
                            ...v,
                            showInSkills: e.target.checked,
                        }))
                    }
                />
                Tampilkan di bagian Keahlian situs
            </label>

            <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" disabled={pending}>
                    {pending ? "Menyimpan…" : submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending}
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                )}
                {error && (
                    <p role="alert" className="text-destructive text-sm">
                        {error}
                    </p>
                )}
            </div>
        </form>
    );
}

function TechnologyItem({
    tech,
    categories,
    canUp,
    canDown,
}: {
    tech: TechnologyRow;
    categories: CategoryRow[];
    canUp: boolean;
    canDown: boolean;
}) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <li className="border-border/60 bg-background/40 rounded-xl border p-4">
                <TechnologyForm
                    initial={{
                        name: tech.name,
                        categoryId: tech.categoryId ?? "",
                        showInSkills: tech.showInSkills,
                    }}
                    categories={categories}
                    submitLabel="Simpan"
                    onSubmit={(input) => updateTechnologyAction(tech.id, input)}
                    onDone={() => setEditing(false)}
                    onCancel={() => setEditing(false)}
                />
            </li>
        );
    }

    return (
        <li className={rowClass}>
            <div className="min-w-0">
                <p className="font-medium">{tech.name}</p>
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm">
                    <span className="font-mono text-xs">{tech.slug}</span>
                    {!tech.showInSkills && <span>Tersembunyi di Keahlian</span>}
                    {tech.projectCount > 0 && (
                        <span>{tech.projectCount} proyek</span>
                    )}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
                <MoveButtons
                    name={tech.name}
                    canUp={canUp}
                    canDown={canDown}
                    onMove={(d) => moveTechnologyAction(tech.id, d)}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Ubah ${tech.name}`}
                    onClick={() => setEditing(true)}
                >
                    Ubah
                </Button>
                <ConfirmDelete
                    name={tech.name}
                    prompt="Hapus teknologi ini?"
                    action={() => deleteTechnologyAction(tech.id)}
                />
            </div>
        </li>
    );
}

/* --------------------------------- Halaman --------------------------------- */

export function SkillsManager({
    categories,
    technologies,
}: {
    categories: CategoryRow[];
    technologies: TechnologyRow[];
}) {
    const byCategory = new Map<string | null, TechnologyRow[]>();
    for (const tech of technologies) {
        const list = byCategory.get(tech.categoryId) ?? [];
        list.push(tech);
        byCategory.set(tech.categoryId, list);
    }

    const uncategorized = byCategory.get(null) ?? [];
    const groups: { key: string; title: string; items: TechnologyRow[] }[] = [
        ...categories.map((c) => ({
            key: c.id,
            title: c.name,
            items: byCategory.get(c.id) ?? [],
        })),
        ...(uncategorized.length > 0
            ? [{ key: "none", title: "Tanpa kategori", items: uncategorized }]
            : []),
    ];

    return (
        <div className="space-y-6">
            <Section
                title="Kategori"
                description="Pengelompokan di bagian Keahlian situs. Urutannya sama dengan di situs."
            >
                {categories.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Belum ada kategori.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {categories.map((c, i) => (
                            <CategoryItem
                                key={c.id}
                                category={c}
                                techCount={byCategory.get(c.id)?.length ?? 0}
                                canUp={i > 0}
                                canDown={i < categories.length - 1}
                            />
                        ))}
                    </ul>
                )}
                <CategoryForm
                    label="Kategori baru"
                    submitLabel="Tambah"
                    onSubmit={createCategoryAction}
                    resetOnSuccess
                />
            </Section>

            <Section
                title="Teknologi"
                description="Dipakai di bagian Keahlian dan proyek. Tidak bisa dihapus selama masih dipakai proyek."
            >
                <TechnologyForm
                    initial={{ name: "", categoryId: "", showInSkills: true }}
                    categories={categories}
                    submitLabel="Tambah teknologi"
                    onSubmit={createTechnologyAction}
                    resetOnSuccess
                />

                {groups.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Belum ada teknologi.
                    </p>
                ) : (
                    <div className="space-y-6 pt-2">
                        {groups.map((group) => (
                            <div key={group.key} className="space-y-2">
                                <h3 className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
                                    {group.title} · {group.items.length}
                                </h3>
                                {group.items.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        Belum ada teknologi di kategori ini.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {group.items.map((tech, i) => (
                                            <TechnologyItem
                                                key={tech.id}
                                                tech={tech}
                                                categories={categories}
                                                canUp={i > 0}
                                                canDown={
                                                    i < group.items.length - 1
                                                }
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Section>
        </div>
    );
}
