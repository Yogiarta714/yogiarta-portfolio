import type { Metadata } from "next";
import { connection } from "next/server";
import { ProfileForm } from "@/components/admin/profile-form";
import { getProfile } from "@/lib/admin-queries/profile";
import { toProfileValues } from "@/lib/validators/profile";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
    // Halaman admin selalu dinamis: tunggu request sebelum menyentuh database
    await connection();
    const row = await getProfile();

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl">Profil</h1>
                <p className="text-muted-foreground text-sm">
                    Teks utama yang tampil di halaman publik.
                </p>
            </div>
            <ProfileForm initial={toProfileValues(row)} />
        </div>
    );
}
