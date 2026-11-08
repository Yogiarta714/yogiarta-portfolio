import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { count } from "drizzle-orm";
import { z } from "zod";
import { createDb } from "../src/db/client";
import { admins } from "../src/db/schema";
import { askHidden, askText, confirm } from "./lib/prompt";

config({ path: ".env.local" });

async function main() {
    const url = process.env.DATABASE_URL_UNPOOLED;
    if (!url) throw new Error("DATABASE_URL_UNPOOLED belum diisi.");

    console.log(`Database tujuan: ${new URL(url).host}`);
    const { db, pool } = createDb(url);

    try {
        const [row] = await db.select({ total: count() }).from(admins);
        if ((row?.total ?? 0) > 0) {
            console.log("Admin sudah ada, tidak ada yang diubah.");
            console.log(
                "Untuk mengganti password, pakai: pnpm admin:set-password",
            );
            return;
        }

        if (!(await confirm("Buat admin di database ini?"))) {
            console.log("Dibatalkan.");
            return;
        }

        const email = z
            .string()
            .email("Format email tidak valid.")
            .max(254)
            .parse((await askText("Email admin: ")).trim().toLowerCase());

        const password = await askHidden("Password (minimal 12 karakter): ");
        if (password.length < 12)
            throw new Error("Password minimal 12 karakter.");
        if (password.length > 200)
            throw new Error("Password maksimal 200 karakter.");

        const ulang = await askHidden("Ulangi password: ");
        if (ulang !== password) throw new Error("Password tidak sama.");

        const passwordHash = await bcrypt.hash(password, 12);
        await db.insert(admins).values({ email, passwordHash });
        console.log(`Admin dibuat: ${email}`);
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error("Gagal:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
