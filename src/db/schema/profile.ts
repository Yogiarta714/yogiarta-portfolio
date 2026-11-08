import { sql } from "drizzle-orm";
import {
    boolean,
    check,
    index,
    integer,
    pgTable,
    text,
    uuid,
} from "drizzle-orm/pg-core";
import { media } from "./media";
import { createdAt, updatedAt } from "./helpers";

export const profile = pgTable(
    "profile",
    {
        singleton: boolean("singleton").primaryKey().notNull().default(true),
        fullName: text("full_name").notNull(),
        shortName: text("short_name").notNull(),
        availabilityText: text("availability_text"),
        heroTitle: text("hero_title").notNull(),
        heroSummary: text("hero_summary").notNull(),
        aboutLead: text("about_lead"),
        aboutBodyMd: text("about_body_md").notNull().default(""),
        university: text("university"),
        location: text("location"),
        publicEmail: text("public_email"),
        contactHeading: text("contact_heading"),
        footerText: text("footer_text"),
        avatarMediaId: uuid("avatar_media_id").references(() => media.id, {
            onDelete: "set null",
        }),
        cvMediaId: uuid("cv_media_id").references(() => media.id, {
            onDelete: "set null",
        }),
        ogImageMediaId: uuid("og_image_media_id").references(() => media.id, {
            onDelete: "set null",
        }),
        seoTitle: text("seo_title"),
        seoDescription: text("seo_description"),
        updatedAt: updatedAt(),
    },
    (t) => [check("profile_singleton_check", sql`${t.singleton} = true`)],
);

export const socialLinks = pgTable(
    "social_links",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        platform: text("platform").notNull(),
        label: text("label").notNull(),
        url: text("url").notNull(),
        sortOrder: integer("sort_order").notNull().default(0),
        isVisible: boolean("is_visible").notNull().default(true),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (t) => [index("social_links_sort_idx").on(t.sortOrder)],
);
