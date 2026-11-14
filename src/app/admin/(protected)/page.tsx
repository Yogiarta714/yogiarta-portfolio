import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { adminNavItems } from "@/components/admin/nav-items";
import { getDashboardSummary } from "@/lib/admin-queries/dashboard";
import { requireAdmin } from "@/lib/auth/require-admin";
import { buildAttentionItems } from "@/lib/dashboard-attention";

export const metadata: Metadata = {
    title: "Dashboard · Admin",
    robots: { index: false, follow: false },
};

export default async function DashboardPage() {
    const admin = await requireAdmin();
    const summary = await getDashboardSummary();
    const attention = buildAttentionItems(summary);
    const shortcuts = adminNavItems.filter(
        (item) => item.ready && item.href !== "/admin",
    );

    return (
        <div className="max-w-3xl space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Selamat datang. Kamu masuk sebagai {admin.email}.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Perlu perhatian</CardTitle>
                    <CardDescription>
                        Hal yang masih kosong atau belum terbit di situs.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attention.length === 0 ? (
                        <p className="text-sm">Semua bagian sudah terisi.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {attention.map((text) => (
                                <li key={text} className="flex gap-2">
                                    <span
                                        aria-hidden
                                        className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                                    />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {shortcuts.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-lg">Pintasan</h2>
                    <div className="flex flex-wrap gap-2">
                        {shortcuts.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={buttonVariants({
                                    variant: "outline",
                                })}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
