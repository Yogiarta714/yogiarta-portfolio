"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/action-result";

/** Menjalankan Server Action dari komponen klien dan mengelola status proses dan pesan galat */
export function useAction() {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function run(
        fn: () => Promise<ActionResult>,
        onSuccess?: () => void,
        onError?: () => void,
    ) {
        setError(null);
        startTransition(async () => {
            const result = await fn();
            if (result.ok) {
                onSuccess?.();
            } else {
                setError(
                    result.error.fields?.name?.[0] ?? result.error.message,
                );
                onError?.();
            }
        });
    }

    return { pending, error, run };
}
