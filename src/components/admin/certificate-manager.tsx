"use client";

import {
    deleteCertificateAction,
    moveCertificateAction,
    setCertificateVisibleAction,
} from "@/actions/credentials";
import { CertificateForm } from "@/components/admin/certificate-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ItemList, type ListItem } from "@/components/admin/item-list";
import { Button } from "@/components/ui/button";
import type { CertificateRow } from "@/lib/admin-queries/credentials";
import { formatMonthYear } from "@/lib/career-format";
import { toCertificateValues } from "@/lib/credentials-form";
import type { MediaItem } from "@/lib/media-rules";

export function CertificateManager({
    items,
    library,
    today,
}: {
    items: CertificateRow[];
    library: MediaItem[];
    today: string;
}) {
    const byId = new Map(items.map((row) => [row.id, row]));

    const listItems: ListItem[] = items.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.issuer,
        meta: `${formatMonthYear(row.issuedDate)} · ${row.fileName ?? "tanpa file"}`,
        visible: row.isVisible,
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    {items.length} data. Urutan di sini adalah urutan di situs.
                </p>
                <FormDialog
                    title="Tambah sertifikat"
                    trigger={(open) => (
                        <Button type="button" onClick={open}>
                            Tambah sertifikat
                        </Button>
                    )}
                >
                    {(close) => (
                        <CertificateForm
                            id={null}
                            initial={toCertificateValues(null, today)}
                            library={library}
                            onDone={close}
                        />
                    )}
                </FormDialog>
            </div>

            <ItemList
                items={listItems}
                empty="Belum ada sertifikat. Klik Tambah sertifikat untuk memulai."
                deleteDescription="Catatan sertifikat dihapus. File-nya tetap ada di perpustakaan Media."
                onMove={moveCertificateAction}
                onToggleVisible={setCertificateVisibleAction}
                onDelete={deleteCertificateAction}
                renderEdit={(id, title) => {
                    const row = byId.get(id);
                    if (!row) return null;
                    return (
                        <FormDialog
                            title="Ubah sertifikat"
                            trigger={(open) => (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Ubah ${title}`}
                                    onClick={open}
                                >
                                    Ubah
                                </Button>
                            )}
                        >
                            {(close) => (
                                <CertificateForm
                                    id={id}
                                    initial={toCertificateValues(row, today)}
                                    library={library}
                                    onDone={close}
                                />
                            )}
                        </FormDialog>
                    );
                }}
            />
        </div>
    );
}
