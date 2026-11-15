"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="max-w-md space-y-4">
            <h1 className="text-2xl">Terjadi kesalahan</h1>
            <p className="text-muted-foreground text-sm">
                Halaman ini gagal dimuat. Coba lagi. Kalau masih gagal, muat
                ulang halaman atau masuk kembali.
            </p>
            {error.digest && (
                <p className="text-muted-foreground font-mono text-xs">
                    Kode: {error.digest}
                </p>
            )}
            <Button onClick={reset}>Coba lagi</Button>
        </div>
    );
}
