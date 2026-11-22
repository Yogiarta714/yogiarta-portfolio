"use client";

import {
    deleteEducationAction,
    moveEducationAction,
    setEducationVisibleAction,
} from "@/actions/career";
import { EducationForm } from "@/components/admin/education-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ItemList, type ListItem } from "@/components/admin/item-list";
import { Button } from "@/components/ui/button";
import type { EducationRow } from "@/lib/admin-queries/career";
import { formatYearRange } from "@/lib/career-format";
import { toEducationValues } from "@/lib/career-form";

export function EducationManager({
    items,
    today,
}: {
    items: EducationRow[];
    today: string;
}) {
    const byId = new Map(items.map((row) => [row.id, row]));

    const listItems: ListItem[] = items.map((row) => ({
        id: row.id,
        title: `${row.degree} ${row.field}`,
        subtitle: row.institution,
        meta: formatYearRange(row.startYear, row.endYear),
        visible: row.isVisible,
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    {items.length} data. Urutan di sini adalah urutan di situs.
                </p>
                <FormDialog
                    title="Tambah pendidikan"
                    trigger={(open) => (
                        <Button type="button" onClick={open}>
                            Tambah pendidikan
                        </Button>
                    )}
                >
                    {(close) => (
                        <EducationForm
                            id={null}
                            initial={toEducationValues(null, today)}
                            onDone={close}
                        />
                    )}
                </FormDialog>
            </div>

            <ItemList
                items={listItems}
                empty="Belum ada pendidikan. Klik Tambah pendidikan untuk memulai."
                onMove={moveEducationAction}
                onToggleVisible={setEducationVisibleAction}
                onDelete={deleteEducationAction}
                renderEdit={(id, title) => {
                    const row = byId.get(id);
                    if (!row) return null;
                    return (
                        <FormDialog
                            title="Ubah pendidikan"
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
                                <EducationForm
                                    id={id}
                                    initial={toEducationValues(row, today)}
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
