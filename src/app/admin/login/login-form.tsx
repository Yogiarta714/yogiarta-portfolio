"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";

export function LoginForm() {
    const [state, formAction, pending] = useActionState<
        ActionResult | undefined,
        FormData
    >(loginAction, undefined);
    // Email disimpan di state agar tidak terhapus saat form direset.
    const [email, setEmail] = useState("");

    const error = state && !state.ok ? state.error : null;
    const emailError = error?.fields?.email?.[0];
    const passwordError = error?.fields?.password?.[0];

    // Setelah gagal, pindahkan fokus ke kolom yang perlu diperbaiki.
    useEffect(() => {
        if (!state || state.ok) return;
        const target = state.error.fields?.email ? "email" : "password";
        document.getElementById(target)?.focus();
    }, [state]);

    return (
        <form action={formAction} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                    <p id="email-error" className="text-destructive text-sm">
                        {emailError}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                        passwordError ? "password-error" : undefined
                    }
                />
                {passwordError && (
                    <p id="password-error" className="text-destructive text-sm">
                        {passwordError}
                    </p>
                )}
            </div>

            {error && error.code !== "VALIDATION" && (
                <p role="alert" className="text-destructive text-sm">
                    {error.message}
                </p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Masuk..." : "Masuk"}
            </Button>
        </form>
    );
}
