import "server-only";
import { createHmac } from "node:crypto";
import { and, count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { env } from "@/lib/env";

export const MAX_FAILED_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

export async function getClientIpHash() {
    const h = await headers();
    const ip =
        h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        h.get("x-real-ip") ||
        "unknown";
    return createHmac("sha256", env.AUTH_SECRET).update(ip).digest("hex");
}

export async function isRateLimited(ipHash: string) {
    const [row] = await db
        .select({ total: count() })
        .from(loginAttempts)
        .where(
            and(
                eq(loginAttempts.ipHash, ipHash),
                eq(loginAttempts.succeeded, false),
                sql`${loginAttempts.attemptedAt} > now() - make_interval(mins => ${WINDOW_MINUTES})`,
            ),
        );
    return (row?.total ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export async function recordAttempt(ipHash: string, succeeded: boolean) {
    await db.insert(loginAttempts).values({ ipHash, succeeded });
    // Bersih-bersih: catatan yang lebih tua dari 24 jam tidak diperlukan lagi.
    await db
        .delete(loginAttempts)
        .where(sql`${loginAttempts.attemptedAt} < now() - interval '1 day'`);
}
