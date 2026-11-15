export type AdminNavItem = {
    label: string;
    href: string;
    ready: boolean; // ubah ke true saat halamannya sudah dibuat
};

export const adminNavItems: AdminNavItem[] = [
    { label: "Dashboard", href: "/admin", ready: true },
    { label: "Profil", href: "/admin/profile", ready: false },
    { label: "Proyek", href: "/admin/projects", ready: false },
    { label: "Skills dan teknologi", href: "/admin/skills", ready: false },
    { label: "Pengalaman", href: "/admin/experience", ready: false },
    { label: "Pendidikan", href: "/admin/education", ready: false },
    { label: "Sertifikat", href: "/admin/certificates", ready: false },
    { label: "Prestasi", href: "/admin/achievements", ready: false },
    { label: "Tautan sosial", href: "/admin/social-links", ready: false },
    { label: "Pengaturan", href: "/admin/settings", ready: false },
];
