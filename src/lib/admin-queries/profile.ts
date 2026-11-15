import "server-only";
import { db } from "@/db";
import { profile } from "@/db/schema";

/** Baris profil tunggal, atau null kalau belum pernah disimpan */
export async function getProfile() {
    const [row] = await db.select().from(profile).limit(1);
    return row ?? null;
}
