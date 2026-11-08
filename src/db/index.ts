import "server-only";
import { env } from "@/lib/env";
import { createDb } from "./client";

const { db } = createDb(env.DATABASE_URL);

export { db };
