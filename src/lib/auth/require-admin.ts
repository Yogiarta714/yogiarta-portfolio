import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { readSessionCookie, verifySessionToken } from "./session";

// Mengembalikan admin yang sedang login, atau null
export const getAdmin = cache(async () => {
    const session = await verifySessionToken(await readSessionCookie());
    if (!session) return null;

    const [admin] = await db
        .select({
            id: admins.id,
            email: admins.email,
            sessionVersion: admins.sessionVersion,
        })
        .from(admins)
        .where(eq(admins.id, session.adminId))
        .limit(1);

    // session_version berbeda berarti sesi sudah dicabut
    if (!admin || admin.sessionVersion !== session.sessionVersion) return null;

    return { id: admin.id, email: admin.email };
});

// Untuk halaman dan layout: tanpa sesi valid, alihkan ke login.
export async function requireAdmin() {
    const admin = await getAdmin();
    if (!admin) redirect("/admin/login");
    return admin;
}
