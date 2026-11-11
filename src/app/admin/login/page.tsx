import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
    title: "Masuk · Admin",
    robots: { index: false, follow: false },
};

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">Masuk</h1>
                    <p className="text-muted-foreground text-sm">
                        Halaman ini hanya untuk admin.
                    </p>
                </div>
                <LoginForm />
            </div>
        </main>
    );
}
