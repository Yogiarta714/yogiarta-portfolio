import { config } from "dotenv";
import { count } from "drizzle-orm";
import { createDb } from "../src/db/client";
import {
    achievements,
    certificates,
    education,
    experiences,
    profile,
    projects,
    projectTechnologies,
    skillCategories,
    socialLinks,
    technologies,
} from "../src/db/schema";
import { confirm } from "./lib/prompt";

config({ path: ".env.local" });

const toSlug = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

function must<T>(value: T | undefined, label: string): T {
    if (value === undefined) throw new Error(`Data tidak ditemukan: ${label}`);
    return value;
}

async function main() {
    const url = process.env.DATABASE_URL_UNPOOLED;
    if (!url) throw new Error("DATABASE_URL_UNPOOLED belum diisi.");

    console.log(`Database tujuan: ${new URL(url).host}`);
    console.log("Skrip ini HANYA untuk database dev, bukan production.");
    const { db, pool } = createDb(url);

    try {
        const tables = [
            profile,
            socialLinks,
            skillCategories,
            technologies,
            projects,
            experiences,
            education,
            certificates,
            achievements,
        ];
        for (const table of tables) {
            const [row] = await db.select({ total: count() }).from(table);
            if ((row?.total ?? 0) > 0) {
                console.log("Sudah ada data di database ini, seed dibatalkan.");
                return;
            }
        }

        if (!(await confirm("Isi database ini dengan data contoh?"))) {
            console.log("Dibatalkan.");
            return;
        }

        await db.transaction(async (tx) => {
            await tx.insert(profile).values({
                fullName: "I Kadek Yogiarta Adi Winata",
                shortName: "yogiarta",
                availabilityText: "Terbuka untuk magang dan kolaborasi",
                heroTitle:
                    "Mahasiswa Informatika yang membangun aplikasi web dan model machine learning.",
                heroSummary:
                    "Saya mengerjakan proyek dari database sampai antarmuka. Saat ini fokus pada pengembangan web full-stack dan analisis data.",
                aboutLead:
                    "Saya suka mengubah masalah sehari-hari menjadi aplikasi kecil yang rapi dan bisa dipakai.",
                aboutBodyMd:
                    "Dua tahun terakhir saya belajar membangun aplikasi dengan Laravel Livewire dan React,lalu mulai menekuni TypeScript dan Next.js. Di sisi data, saya mencoba model klasifikasi dan regresi untuk dataset dari mata kuliah dan kompetisi.",
                university: "Universitas Udayana",
                location: "Denpasar, Bali",
                contactHeading:
                    "Punya ide, proyek, atau tawaran magang? Mari bicara.",
                footerText: "Dibuat dengan Next.js, Neon, dan Vercel",
            });

            await tx.insert(socialLinks).values([
                {
                    platform: "github",
                    label: "GitHub",
                    url: "https://github.com/Yogiarta714",
                    sortOrder: 1,
                },
                {
                    platform: "linkedin",
                    label: "LinkedIn",
                    url: "https://linkedin.com/in/yogiwinata",
                    sortOrder: 2,
                },
                {
                    platform: "instagram",
                    label: "Instagram",
                    url: "https://instagram.com/yogiarta06",
                    sortOrder: 3,
                },
            ]);

            const kategori = await tx
                .insert(skillCategories)
                .values([
                    { name: "Frontend", sortOrder: 1 },
                    { name: "Backend", sortOrder: 2 },
                    { name: "Data", sortOrder: 3 },
                    { name: "Tools", sortOrder: 4 },
                ])
                .returning();
            const idKategori = (nama: string) =>
                must(
                    kategori.find((k) => k.name === nama),
                    nama,
                ).id;

            const daftarTeknologi: [string, string][] = [
                ["Next.js", "Frontend"],
                ["React", "Frontend"],
                ["TypeScript", "Frontend"],
                ["Tailwind CSS", "Frontend"],
                ["Laravel", "Backend"],
                ["PHP", "Backend"],
                ["Node.js", "Backend"],
                ["PostgreSQL", "Data"],
                ["MySQL", "Data"],
                ["Git", "Tools"],
                ["Figma", "Tools"],
            ];
            const teknologi = await tx
                .insert(technologies)
                .values(
                    daftarTeknologi.map(([name, kategoriNama], i) => ({
                        name,
                        slug: toSlug(name),
                        categoryId: idKategori(kategoriNama),
                        sortOrder: i + 1,
                    })),
                )
                .returning();
            const idTeknologi = (nama: string) =>
                must(
                    teknologi.find((t) => t.name === nama),
                    nama,
                ).id;

                const [proyekSatu, proyekDua] = await tx
                    .insert(projects)
                    .values([
                        {
                            slug: "sistem-reservasi-laboratorium",
                            title: "Sistem Reservasi Laboratorium",
                            summary:
                                "Aplikasi web untuk memesan jadwal laboratorium komputer kampus, lengkap dengan kalender ketersediaan dan persetujuan oleh admin.",
                            descriptionMd: [
                                "Aplikasi untuk menggantikan pencatatan jadwal laboratorium yang sebelumnya memakai spreadsheet.",
                                "",
                                "**Fitur utama**",
                                "",
                                "- Kalender ketersediaan ruangan per hari",
                                "- Pengajuan reservasi oleh mahasiswa dan persetujuan oleh admin",
                                "- Notifikasi status reservasi",
                                "- Riwayat pemakaian laboratorium",
                                "",
                                "**Yang dipelajari**: merancang skema database relasional, validasi form di sisi server, dan membagi hak akses antara mahasiswa dan admin.",
                            ].join("\n"),
                            category: "web",
                            projectDate: "2025-06-01",
                            role: "Full-stack developer",
                            githubUrl: "https://github.com/GANTI/reservasi-lab",
                            demoUrl: "https://example.com",
                            status: "published",
                            isFeatured: true,
                            sortOrder: 1,
                            publishedAt: new Date(),
                        },
                        {
                            slug: "aplikasi-inventaris-himpunan",
                            title: "Aplikasi Inventaris Himpunan",
                            summary:
                                "Aplikasi pencatatan dan peminjaman barang milik himpunan mahasiswa, dengan pelacakan status barang dan laporan bulanan.",
                            descriptionMd: [
                                "Dibuat untuk membantu pengurus himpunan mencatat barang yang dipinjam dan dikembalikan.",
                                "",
                                "**Fitur utama**",
                                "",
                                "- Daftar barang beserta kondisi dan jumlahnya",
                                "- Pencatatan peminjaman dan pengembalian",
                                "- Laporan bulanan yang bisa diunduh",
                            ].join("\n"),
                            category: "web",
                            projectDate: "2025-01-01",
                            role: "Backend developer",
                            githubUrl:
                                "https://github.com/GANTI/inventaris-himpunan",
                            status: "published",
                            sortOrder: 2,
                            publishedAt: new Date(),
                        },
                    ])
                    .returning();
                const p1 = must(proyekSatu, "proyek satu").id;
                const p2 = must(proyekDua, "proyek dua").id;

                await tx.insert(projectTechnologies).values([
                    { projectId: p1, technologyId: idTeknologi("Next.js") },
                    { projectId: p1, technologyId: idTeknologi("TypeScript") },
                    { projectId: p1, technologyId: idTeknologi("PostgreSQL") },
                    {
                        projectId: p1,
                        technologyId: idTeknologi("Tailwind CSS"),
                    },
                    { projectId: p2, technologyId: idTeknologi("Laravel") },
                    { projectId: p2, technologyId: idTeknologi("PHP") },
                    { projectId: p2, technologyId: idTeknologi("MySQL") },
                ]);

            await tx.insert(experiences).values({
                kind: "organization",
                organization: "Student Innovation Centre",
                roleTitle: "Anggota Technology and Human Development",
                startDate: "2025-01-01", // GANTI
                descriptionMd:
                    "- [Poin pencapaian satu]\n- [Poin pencapaian dua]",
                sortOrder: 1,
            });

            await tx.insert(education).values({
                institution: "Universitas Udayana",
                degree: "S1",
                field: "Informatika",
                startYear: 2024,
                sortOrder: 1,
            });

            await tx.insert(certificates).values({
                title: "Anggota Technology and Human Development",
                issuer: "Student Innovation Centre",
                issuedDate: "2025-12-06",
                sortOrder: 1,
            });

            await tx.insert(achievements).values({
                title: "Invention 2026",
                organizer: "Himpunan Mahasiswa Informatika",
                level: "kampus",
                achievedDate: "2025-08-18",
                sortOrder: 1,
            });
        });

        console.log("Data contoh berhasil dimasukkan.");
    } finally {
        await pool.end();
    }
}

main().catch((err) => {
    console.error("Gagal:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
});
