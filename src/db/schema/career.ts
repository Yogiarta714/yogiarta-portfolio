import {
    boolean,
    date,
    index,
    integer,
    pgTable,
    smallint,
    text,
    uuid,
} from "drizzle-orm/pg-core";
import { experienceKind } from "./enums";
import { createdAt, updatedAt } from "./helpers";
import { media } from "./media";

export const experiences = pgTable(
    "experiences",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        kind: experienceKind("kind").notNull().default("organization"),
        organization: text("organization").notNull(),
        roleTitle: text("role_title").notNull(),
        location: text("location"),
        startDate: date("start_date").notNull(),
        endDate: date("end_date"),
        descriptionMd: text("description_md"),
        url: text("url"),
        sortOrder: integer("sort_order").notNull().default(0),
        isVisible: boolean("is_visible").notNull().default(true),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [index("experiences_visible_sort_idx").on(t.isVisible, t.sortOrder)],
);

export const education = pgTable(
    "education",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        institution: text("institution").notNull(),
        degree: text("degree").notNull(),
        field: text("field").notNull(),
        startYear: smallint("start_year").notNull(),
        endYear: smallint("end_year"),
        descriptionMd: text("description_md"),
        sortOrder: integer("sort_order").notNull().default(0),
        isVisible: boolean("is_visible").notNull().default(true),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [index("education_visible_sort_idx").on(t.isVisible, t.sortOrder)],
);

export const certificates = pgTable(
    "certificates",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        issuer: text("issuer").notNull(),
        issuedDate: date("issued_date").notNull(),
        credentialUrl: text("credential_url"),
        fileMediaId: uuid("file_media_id").references(() => media.id, {
            onDelete: "set null",
        }),
        sortOrder: integer("sort_order").notNull().default(0),
        isVisible: boolean("is_visible").notNull().default(true),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index("certificates_visible_sort_idx").on(t.isVisible, t.sortOrder),
    ],
);

export const achievements = pgTable(
    "achievements",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        title: text("title").notNull(),
        organizer: text("organizer"),
        level: text("level"),
        achievedDate: date("achieved_date").notNull(),
        description: text("description"),
        proofUrl: text("proof_url"),
        sortOrder: integer("sort_order").notNull().default(0),
        isVisible: boolean("is_visible").notNull().default(true),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [
        index("achievements_visible_sort_idx").on(t.isVisible, t.sortOrder),
    ],
);
