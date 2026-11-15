"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import { profileSchema, readProfileForm } from "@/lib/validators/profile";

export async function saveProfileAction(
    _prev: ActionResult | undefined,
    formData: FormData,
): Promise<ActionResult> {
    const admin = await getAdmin();
    if (!admin)
        return fail("UNAUTHORIZED", "Sesi berakhir. Silakan masuk lagi.");

    const parsed = profileSchema.safeParse(readProfileForm(formData));
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian yang ditandai.",
            parsed.error.flatten().fieldErrors,
        );
    }

    try {
        // Tabel profile hanya punya satu baris (singleton = true)
        await db
            .insert(profile)
            .values({ singleton: true, ...parsed.data })
            .onConflictDoUpdate({
                target: profile.singleton,
                set: { ...parsed.data, updatedAt: sql`now()` },
            });
    } catch (error) {
        console.error("saveProfileAction gagal", error);
        return fail("DATABASE", "Gagal menyimpan. Coba lagi sebentar lagi.");
    }

    revalidatePath("/");
    revalidatePath("/admin/profile");
    return ok(null);
}
