export type DashboardSummary = {
    hasProfile: boolean;
    hasAvatar: boolean;
    hasCv: boolean;
    draftProjects: number;
    publishedProjects: number;
    technologies: number;
    experiences: number;
    education: number;
    certificates: number;
    achievements: number;
    socialLinks: number;
};

// Daftar hal yang masih perlu dilengkapi
export function buildAttentionItems(s: DashboardSummary): string[] {
    const items: string[] = [];

    if (!s.hasProfile) {
        items.push(
            "Profil belum dibuat. Situs publik membutuhkan data profil.",
        );
    } else {
        if (!s.hasAvatar) items.push("Foto profil belum diunggah.");
        if (!s.hasCv) {
            items.push("CV belum diunggah, tombol Unduh CV disembunyikan.");
        }
    }

    if (s.draftProjects > 0) {
        items.push(`${s.draftProjects} proyek masih berstatus draft.`);
    }
    if (s.publishedProjects === 0) {
        items.push(
            "Belum ada proyek terbit, bagian Proyek tidak tampil di situs.",
        );
    }
    if (s.technologies === 0) {
        items.push("Belum ada teknologi, bagian skill tidak tampil di situs.");
    }
    if (s.experiences === 0) {
        items.push("Belum ada pengalaman, bagian Pengalaman tidak tampil.");
    }
    if (s.education === 0) {
        items.push("Belum ada pendidikan, bagian Pendidikan tidak tampil.");
    }
    if (s.certificates === 0) {
        items.push("Belum ada sertifikat, daftar sertifikat tidak tampil.");
    }
    if (s.achievements === 0) {
        items.push("Belum ada prestasi, daftar prestasi tidak tampil.");
    }
    if (s.socialLinks === 0) {
        items.push("Belum ada tautan sosial.");
    }

    return items;
}
