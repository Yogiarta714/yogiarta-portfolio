"use client";

import {
    deleteExperienceAction,
    moveExperienceAction,
    setExperienceVisibleAction,
} from "@/actions/career";
import { ExperienceForm } from "@/components/admin/experience-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ItemList, type ListItem } from "@/components/admin/item-list";
import { Button } from "@/components/ui/button";
import type { ExperienceRow } from "@/lib/admin-queries/career";
import { formatPeriod } from "@/lib/career-format";
import { toExperienceValues } from "@/lib/career-form";

const KIND_LABEL = {
    work: "Pekerjaan",
    organization: "Organisasi",
    volunteer: "Relawan",
} as const;

export function ExperienceManager({
    items,
    today,
}: {
    items: ExperienceRow[];
    today: string;
}) {
    const byId = new Map(items.map((row) => [row.id, row]));

    const listItems: ListItem[] = items.map((row) => ({
        id: row.id,
        title: row.roleTitle,
        subtitle: row.location
            ? `${row.organization} · ${row.location}`
            : row.organization,
        meta: formatPeriod(row.startDate, row.endDate),
        visible: row.isVisible,
        badges: [KIND_LABEL[row.kind]],
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    {items.length} data. Urutan di sini adalah urutan di situs.
                </p>
                <FormDialog
                    title="Tambah pengalaman"
                    trigger={(open) => (
                        <Button type="button" onClick={open}>
                            Tambah pengalaman
                        </Button>
                    )}
                >
                    {(close) => (
                        <ExperienceForm
                            id={null}
                            initial={toExperienceValues(null, today)}
                            onDone={close}
                        />
                    )}
                </FormDialog>
            </div>

            <ItemList
                items={listItems}
                empty="Belum ada pengalaman. Klik Tambah pengalaman untuk memulai."
                onMove={moveExperienceAction}
                onToggleVisible={setExperienceVisibleAction}
                onDelete={deleteExperienceAction}
                renderEdit={(id, title) => {
                    const row = byId.get(id);
                    if (!row) return null;
                    return (
                        <FormDialog
                            title="Ubah pengalaman"
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
                                <ExperienceForm
                                    id={id}
                                    initial={toExperienceValues(row, today)}
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
