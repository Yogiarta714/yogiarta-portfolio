import type { ChangeEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export function Field({
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

export function Section({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="bg-card border-border/60 grid gap-5 rounded-2xl border p-6 shadow-sm lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
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
