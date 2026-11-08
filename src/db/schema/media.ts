import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { mediaKind } from "./enums";
import { createdAt } from "./helpers";

export const media = pgTable(
    "media",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        kind: mediaKind("kind").notNull(),
        blobUrl: text("blob_url").notNull().unique(),
        blobPathname: text("blob_pathname").notNull().unique(),
        originalName: text("original_name").notNull(),
        mimeType: text("mime_type").notNull(),
        sizeBytes: integer("size_bytes").notNull(),
        width: integer("width"),
        height: integer("height"),
        altText: text("alt_text"),
        createdAt: createdAt(),
    },
    (t) => [index("media_kind_idx").on(t.kind)],
);
