import type { Metadata } from "next";
import { connection } from "next/server";
import { MediaUploader } from "@/components/admin/media-uploader";
import { listMedia } from "@/lib/admin-queries/media";
import { formatBytes } from "@/lib/format";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
    await connection();
    const items = await listMedia();

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-2xl">Media</h1>
                <p className="text-muted-foreground text-sm">
                    Gambar dan PDF yang bisa dipakai di profil, proyek, dan
                    sertifikat.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <section className="bg-card space-y-4 rounded-xl border p-6">
                    <h2 className="font-sans text-base font-semibold">
                        Unggah gambar
                    </h2>
                    <MediaUploader kind="image" refreshAfterUpload />
                </section>
                <section className="bg-card space-y-4 rounded-xl border p-6">
                    <h2 className="font-sans text-base font-semibold">
                        Unggah PDF
                    </h2>
                    <MediaUploader kind="pdf" refreshAfterUpload />
                </section>
            </div>

            <section className="space-y-4">
                <h2 className="font-sans text-base font-semibold">
                    Semua file ({items.length})
                </h2>
                {items.length === 0 ? (
                    <p className="text-muted-foreground">Belum ada file.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="bg-card overflow-hidden rounded-xl border"
                            >
                                {item.kind === "image" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.url}
                                        alt={item.altText ?? ""}
                                        loading="lazy"
                                        className="bg-secondary aspect-video w-full object-cover"
                                    />
                                ) : (
                                    <div className="bg-secondary text-muted-foreground grid aspect-video place-items-center font-mono text-sm">
                                        PDF
                                    </div>
                                )}
                                <div className="space-y-1 p-4">
                                    <p
                                        className="truncate font-medium"
                                        title={item.originalName}
                                    >
                                        {item.originalName}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        {formatBytes(item.sizeBytes)}
                                        {item.width && item.height
                                            ? ` · ${item.width}×${item.height}`
                                            : ""}
                                    </p>
                                    {item.kind === "image" && !item.altText && (
                                        <p className="text-muted-foreground text-sm">
                                            Belum ada teks alternatif
                                        </p>
                                    )}
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary inline-block text-sm font-medium underline-offset-4 hover:underline"
                                    >
                                        Buka ↗
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
