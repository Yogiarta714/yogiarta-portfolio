"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
    createSocialLinkAction,
    updateSocialLinkAction,
} from "@/actions/social-links";
import { Field, SelectField } from "@/components/admin/form-kit";
import { Button } from "@/components/ui/button";
import type { ActionError } from "@/lib/action-result";
import type { SocialLinkFormValues } from "@/lib/social-links-form";
import { SOCIAL_PLATFORMS } from "@/lib/validators/social-links";

export function SocialLinkForm({
    id,
    initial,
    onDone,
}: {
    id: string | null;
    initial: SocialLinkFormValues;
    onDone: () => void;
}) {
    const [values, setValues] = useState<SocialLinkFormValues>(initial);
    const [error, setError] = useState<ActionError | null>(null);
    const [pending, startTransition] = useTransition();

    const err = (key: string) => error?.fields?.[key]?.[0];

    function set<K extends keyof SocialLinkFormValues>(
        key: K,
        value: SocialLinkFormValues[K],
    ) {
        setValues((v) => ({ ...v, [key]: value }));
    }

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
                ? await updateSocialLinkAction(id, values)
                : await createSocialLinkAction(values);
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
                label="Platform"
                name="platform"
                value={values.platform}
                error={err("platform")}
                onChange={(e) => set("platform", e.target.value)}
                options={SOCIAL_PLATFORMS.map((p) => ({
                    value: p.value,
                    label: p.label,
                }))}
            />
            <Field
                label="Teks tampilan"
                required
                name="label"
                value={values.label}
                error={err("label")}
                hint="Contoh: github.com/yogiwinata atau nama akunmu."
                onChange={(e) => set("label", e.target.value)}
            />
            <Field
                label="Tautan"
                required
                name="url"
                value={values.url}
                error={err("url")}
                hint="Awali dengan https://. Untuk email, tulis mailto:alamat@email.com."
                onChange={(e) => set("url", e.target.value)}
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
