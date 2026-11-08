import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
    title: "Dashboard · Admin",
    robots: { index: false, follow: false },
};

export default async function DashboardPage() {
    const admin = await requireAdmin();

    return (
        <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
                Kamu masuk sebagai {admin.email}.
            </p>
        </div>
    );
}
