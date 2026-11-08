import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { createDb } from "../src/db/client";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum diisi di .env.local");

const { db, pool } = createDb(url);

async function main() {
    const koneksi = await db.execute(
        sql`select current_database() as database, now() as waktu`,
    );
    console.log("Koneksi OK:", koneksi.rows[0]);

    await db.transaction(async (tx) => {
        const tabel = await tx.execute(
            sql`select count(*)::int as jumlah from information_schema.tables where table_schema = 'public'`,
        );
        console.log("Tabel di schema public:", tabel.rows[0]);
    });
    console.log("Transaksi OK");
}

main()
    .catch((err) => {
        console.error("Gagal:", err);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
