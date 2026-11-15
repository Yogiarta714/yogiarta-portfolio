"use server";

import { inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media, profile } from "@/db/schema";
import {
    fail,
    ok,
    type ActionResult,
    type FieldErrors,
} from "@/lib/action-result";
import { getAdmin } from "@/lib/auth/require-admin";
import {
    profileSchema,
    readProfileForm,
    type ProfileInput,
} from "@/lib/validators/profile";

/** Pastikan media yang dipilih ada dan jenisnya cocok (foto/OG = gambar, CV = PDF). */
async function checkProfileMedia(
    data: ProfileInput,
): Promise<FieldErrors | null> {
    const wanted = [
        {
            field: "avatarMediaId",
            id: data.avatarMediaId,
            kind: "image",
            label: "Foto profil",
        },
        { field: "cvMediaId", id: data.cvMediaId, kind: "pdf", label: "CV" },
        {
            field: "ogImageMediaId",
            id: data.ogImageMediaId,
            kind: "image",
            label: "Gambar OG",
        },
    ] as const;

    const ids = wanted.flatMap((w) => (w.id ? [w.id] : []));
    if (ids.length === 0) return null;

    const rows = await db
        .select({ id: media.id, kind: media.kind })
        .from(media)
        .where(inArray(media.id, ids));
    const kindById = new Map(rows.map((r) => [r.id, r.kind]));

    const errors: FieldErrors = {};
    for (const w of wanted) {
        if (!w.id) continue;
        const kind = kindById.get(w.id);
        if (!kind) {
            errors[w.field] = [`${w.label}: file tidak ditemukan`];
        } else if (kind !== w.kind) {
            errors[w.field] = [
                `${w.label} harus berupa ${w.kind === "pdf" ? "PDF" : "gambar"}`,
            ];
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
}

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
        const mediaErrors = await checkProfileMedia(parsed.data);
        if (mediaErrors) {
            return fail(
                "VALIDATION",
                "Periksa kembali isian yang ditandai.",
                mediaErrors,
            );
        }

        // Tabel profile hanya punya satu baris (singleton = true).
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
