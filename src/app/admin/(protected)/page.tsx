import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
    title: "Dashboard · Admin",
    robots: { index: false, follow: false },
};

export default async function DashboardPage() {
    const admin = await requireAdmin();

    return (
        <div className="max-w-xl space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Kamu masuk sebagai {admin.email}.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Uji tampilan (sementara)</CardTitle>
                    <CardDescription>Dihapus di langkah 4c.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button>Simpan</Button>
                        <Button variant="secondary">Sekunder</Button>
                        <Button variant="outline">Garis</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Hapus</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge>Terbit</Badge>
                        <Badge variant="secondary">Draft</Badge>
                        <Badge variant="outline">Unggulan</Badge>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="contoh">Contoh isian</Label>
                        <Input id="contoh" placeholder="Ketik sesuatu" />
                    </div>
                    <Skeleton className="h-4 w-2/3" />
                    <p className="font-mono text-xs">
                        Teks monospace (JetBrains Mono)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
