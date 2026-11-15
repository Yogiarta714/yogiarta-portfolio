import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
    title: "Masuk · Admin",
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
            <p className="font-heading text-xl font-semibold">yogiarta</p>
            <Card className="w-full max-w-sm">
                <CardContent className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl">Masuk</h1>
                        <p className="text-muted-foreground text-sm">
                            Halaman ini hanya untuk admin.
                        </p>
                    </div>
                    <LoginForm />
                </CardContent>
            </Card>
        </main>
    );
}
