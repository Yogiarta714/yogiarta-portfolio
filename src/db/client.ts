import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

export function createDb(connectionString: string) {
    const pool = new Pool({ connectionString });
    const db = drizzle({ client: pool, schema });
    return { db, pool };
}
