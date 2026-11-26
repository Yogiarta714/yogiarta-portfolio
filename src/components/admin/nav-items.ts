export type AdminNavItem = {
    label: string;
    href: string;
    ready: boolean; // ubah ke true saat halamannya sudah dibuat
};

export const adminNavItems: AdminNavItem[] = [
    { label: "Dashboard", href: "/admin", ready: true },
    { label: "Profil", href: "/admin/profile", ready: true },
    { label: "Proyek", href: "/admin/projects", ready: true },
    { label: "Skills dan teknologi", href: "/admin/skills", ready: true },
    { label: "Pengalaman", href: "/admin/experience", ready: true },
    { label: "Pendidikan", href: "/admin/education", ready: true },
    { label: "Sertifikat", href: "/admin/certificates", ready: true },
    { label: "Prestasi", href: "/admin/achievements", ready: true },
    { label: "Tautan sosial", href: "/admin/social-links", ready: true },
    { label: "Media", href: "/admin/media", ready: true },
    { label: "Pengaturan", href: "/admin/settings", ready: false },
];
