import { Suspense } from "react";
import { logoutAction } from "@/actions/auth";
import { requireAdmin } from "@/lib/auth/require-admin";

async function AdminShell({ children }: { children: React.ReactNode }) {
    const admin = await requireAdmin();

    return (
        <div className="min-h-screen">
            <header className="flex items-center justify-between border-b px-6 py-3">
                <span className="font-medium">Admin</span>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{admin.email}</span>
                    <form action={logoutAction}>
                        <button type="submit" className="underline">
                            Keluar
                        </button>
                    </form>
                </div>
            </header>
            <div className="p-6">{children}</div>
        </div>
    );
}

export default function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<p className="p-6 text-sm">Memuat...</p>}>
            <AdminShell>{children}</AdminShell>
        </Suspense>
    );
}
