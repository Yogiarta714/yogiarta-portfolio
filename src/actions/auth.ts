"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { fail, type ActionResult } from "@/lib/action-result";
import { getDummyHash, verifyPassword } from "@/lib/auth/password";
import {
    getClientIpHash,
    isRateLimited,
    recordAttempt,
} from "@/lib/auth/rate-limit";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";

export async function loginAction(
    _prev: ActionResult | undefined,
    formData: FormData,
): Promise<ActionResult> {
    const parsed = loginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });
    if (!parsed.success) {
        return fail(
            "VALIDATION",
            "Periksa kembali isian kamu.",
            parsed.error.flatten().fieldErrors,
        );
    }
    const { email, password } = parsed.data;

    try {
        const ipHash = await getClientIpHash();

        // Cek batas percobaan lebih dulu, sebelum menghitung bcrypt yang mahal
        if (await isRateLimited(ipHash)) {
            return fail(
                "RATE_LIMITED",
                "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
            );
        }

        const [admin] = await db
            .select()
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);

        // Bandingkan ke hash pura-pura bila email tidak ada
        const hash = admin?.passwordHash ?? (await getDummyHash());
        const valid = await verifyPassword(password, hash);

        if (!admin || !valid) {
            await recordAttempt(ipHash, false);
            return fail("UNAUTHORIZED", "Email atau password salah.");
        }

        await recordAttempt(ipHash, true);
        await db
            .update(admins)
            .set({ lastLoginAt: new Date() })
            .where(eq(admins.id, admin.id));
        await setSessionCookie({
            adminId: admin.id,
            sessionVersion: admin.sessionVersion,
        });
    } catch (error) {
        console.error("loginAction gagal", error);
        return fail("DATABASE", "Tidak bisa masuk sekarang. Coba lagi.");
    }

    // redirect() bekerja dengan melempar error khusus, jadi harus di luar try
    redirect("/admin");
}

export async function logoutAction() {
    await clearSessionCookie();
    redirect("/admin/login");
}
