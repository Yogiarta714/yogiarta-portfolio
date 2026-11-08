import { pgEnum } from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", ["draft", "published"]);
export const mediaKind = pgEnum("media_kind", ["image", "pdf"]);
export const experienceKind = pgEnum("experience_kind", [
    "work",
    "organization",
    "volunteer",
]);
