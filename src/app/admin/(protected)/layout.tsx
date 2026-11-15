import { Suspense } from "react";
import { AdminFrame } from "@/components/admin/admin-frame";
import { AdminFrameSkeleton } from "@/components/admin/admin-frame-skeleton";
import { requireAdmin } from "@/lib/auth/require-admin";

async function AuthenticatedFrame({ children }: { children: React.ReactNode }) {
    const admin = await requireAdmin();
    return <AdminFrame email={admin.email}>{children}</AdminFrame>;
}

export default function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<AdminFrameSkeleton />}>
            <AuthenticatedFrame>{children}</AuthenticatedFrame>
        </Suspense>
    );
}
