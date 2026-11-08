import {
    boolean,
    date,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
    uuid,
} from "drizzle-orm/pg-core";
import { projectStatus } from "./enums";
import { createdAt, updatedAt } from "./helpers";
import { media } from "./media";
import { technologies } from "./skills";

export const projects = pgTable(
    "projects",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        summary: text("summary").notNull(),
        descriptionMd: text("description_md").notNull().default(""),
        category: text("category").notNull(),
        projectDate: date("project_date").notNull(),
        role: text("role"),
        githubUrl: text("github_url"),
        demoUrl: text("demo_url"),
        thumbnailMediaId: uuid("thumbnail_media_id").references(
            () => media.id,
            {
                onDelete: "set null",
            },
        ),
        status: projectStatus("status").notNull().default("draft"),
        isFeatured: boolean("is_featured").notNull().default(false),
        sortOrder: integer("sort_order").notNull().default(0),
        publishedAt: timestamp("published_at", { withTimezone: true }),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index("projects_status_featured_sort_idx").on(
            t.status,
            t.isFeatured,
            t.sortOrder,
        ),
    ],
);

export const projectTechnologies = pgTable(
    "project_technologies",
    {
        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        technologyId: uuid("technology_id")
            .notNull()
            .references(() => technologies.id, { onDelete: "cascade" }),
    },
    (t) => [
        primaryKey({ columns: [t.projectId, t.technologyId] }),
        index("project_technologies_tech_idx").on(t.technologyId),
    ],
);

export const projectMedia = pgTable(
    "project_media",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        mediaId: uuid("media_id")
            .notNull()
            .references(() => media.id, { onDelete: "restrict" }),
        caption: text("caption"),
        sortOrder: integer("sort_order").notNull().default(0),
    },
    (t) => [
        unique("project_media_project_media_unique").on(t.projectId, t.mediaId),
        index("project_media_project_sort_idx").on(t.projectId, t.sortOrder),
    ],
);
