import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { createDb } from "../src/db/client";
import { admins } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";
import { askHidden, confirm } from "./lib/prompt";

config({ path: ".env.local" });

async function main() {
    const url = process.env.DATABASE_URL_UNPOOLED;
    if (!url) throw new Error("DATABASE_URL_UNPOOLED belum diisi.");

    console.log(`Database tujuan: ${new URL(url).host}`);
    const { db, pool } = createDb(url);

    try {
        const [admin] = await db
            .select({ id: admins.id, email: admins.email })
            .from(admins)
            .limit(1);
        if (!admin) {
            console.log("Belum ada admin. Jalankan seed:admin dulu.");
            return;
        }

        console.log(`Admin: ${admin.email}`);
        if (!(await confirm("Ganti password admin ini?"))) {
            console.log("Dibatalkan.");
            return;
        }

        const password = await askHidden(
            "Password baru (minimal 12 karakter): ",
        );
        if (password.length < 12)
            throw new Error("Password minimal 12 karakter.");
        if (password.length > 200)
            throw new Error("Password maksimal 200 karakter.");
        const ulang = await askHidden("Ulangi password baru: ");
        if (ulang !== password) throw new Error("Password tidak sama.");

        const passwordHash = await hashPassword(password);
        await db
            .update(admins)
            .set({
                passwordHash,
                sessionVersion: sql`${admins.sessionVersion} + 1`,
            })
            .where(eq(admins.id, admin.id));

        console.log("Password diganti. Semua sesi lama sudah dicabut.");
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error("Gagal:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
