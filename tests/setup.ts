import { config } from "dotenv";

config({ path: ".env.test.local" });

process.env.AUTH_SECRET = "rahasia-untuk-tes-".repeat(4); // lebih dari 32 karakter
process.env.BLOB_READ_WRITE_TOKEN = "token-tes";
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
// Tanpa TEST_DATABASE_URL, tes yang butuh database dilewati.
process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ??
    "postgresql://user:pass@localhost:5432/tes";
