import "server-only";
import { z } from "zod";

const schema = z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    const nama = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    throw new Error(`Variabel environment belum benar: ${nama}`);
}

export const env = parsed.data;