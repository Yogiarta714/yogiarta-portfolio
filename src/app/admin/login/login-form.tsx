"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/actions/auth";
import type { ActionResult } from "@/lib/action-result";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2";

export function LoginForm() {
    const [state, formAction, pending] = useActionState<
        ActionResult | undefined,
        FormData
    >(loginAction, undefined);
    // Email disimpan di state agar tidak terhapus saat form direset
    const [email, setEmail] = useState("");

    const error = state && !state.ok ? state.error : null;
    const emailError = error?.fields?.email?.[0];
    const passwordError = error?.fields?.password?.[0];

    return (
        <form action={formAction} className="space-y-4" noValidate>
            <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={inputClass}
                />
                {emailError && (
                    <p id="email-error" className="text-sm text-red-600">
                        {emailError}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                    Password
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                        passwordError ? "password-error" : undefined
                    }
                    className={inputClass}
                />
                {passwordError && (
                    <p id="password-error" className="text-sm text-red-600">
                        {passwordError}
                    </p>
                )}
            </div>

            {error && error.code !== "VALIDATION" && (
                <p role="alert" className="text-sm text-red-600">
                    {error.message}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
            >
                {pending ? "Masuk..." : "Masuk"}
            </button>
        </form>
    );
}
