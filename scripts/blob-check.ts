import { del, put } from "@vercel/blob";

async function main() {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.log("BLOB_READ_WRITE_TOKEN tidak terbaca dari environment.");
        return;
    }
    console.log(
        "Format token:",
        token.startsWith("vercel_blob_rw_") ? "benar" : "TIDAK dikenal",
        "| panjang:",
        token.length,
        "| ada spasi/kutip:",
        /\s|["']/.test(token),
    );

    const [, , , storeId, secret] = token.split("_");
    console.log(
        "ID store di token:",
        storeId ?? "(tidak ada)",
        "| panjang bagian rahasia:",
        secret?.length ?? 0,
    );

    for (const access of ["public", "private"] as const) {
        try {
            const blob = await put(`healthcheck/ping-${access}.txt`, "ok", {
                access,
                addRandomSuffix: true,
            });
            console.log(`access=${access}: BERHASIL`);
            await del(blob.url);
        } catch (error) {
            console.log(
                `access=${access}: GAGAL -`,
                error instanceof Error ? error.message : error,
            );
        }
    }
}

main();
