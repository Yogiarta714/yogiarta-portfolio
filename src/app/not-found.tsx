import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-muted-foreground font-mono text-sm">404</p>
            <h1 className="text-3xl">Halaman tidak ditemukan</h1>
            <p className="text-muted-foreground max-w-sm text-sm">
                Alamat yang kamu buka tidak ada, atau halaman ini belum
                diterbitkan.
            </p>
            <Link href="/" className={buttonVariants()}>
                Kembali ke beranda
            </Link>
        </main>
    );
}
