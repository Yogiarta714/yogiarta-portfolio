"use client";

import {
    deleteAchievementAction,
    moveAchievementAction,
    setAchievementVisibleAction,
} from "@/actions/credentials";
import { AchievementForm } from "@/components/admin/achievement-form";
import { FormDialog } from "@/components/admin/form-dialog";
import { ItemList, type ListItem } from "@/components/admin/item-list";
import { Button } from "@/components/ui/button";
import type { AchievementRow } from "@/lib/admin-queries/credentials";
import { formatMonthYear } from "@/lib/career-format";
import { toAchievementValues } from "@/lib/credentials-form";

export function AchievementManager({
    items,
    today,
}: {
    items: AchievementRow[];
    today: string;
}) {
    const byId = new Map(items.map((row) => [row.id, row]));

    const listItems: ListItem[] = items.map((row) => ({
        id: row.id,
        title: row.title,
        subtitle: row.organizer ?? undefined,
        meta: row.level
            ? `${formatMonthYear(row.achievedDate)} · ${row.level}`
            : formatMonthYear(row.achievedDate),
        visible: row.isVisible,
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    {items.length} data. Urutan di sini adalah urutan di situs.
                </p>
                <FormDialog
                    title="Tambah prestasi"
                    trigger={(open) => (
                        <Button type="button" onClick={open}>
                            Tambah prestasi
                        </Button>
                    )}
                >
                    {(close) => (
                        <AchievementForm
                            id={null}
                            initial={toAchievementValues(null, today)}
                            onDone={close}
                        />
                    )}
                </FormDialog>
            </div>

            <ItemList
                items={listItems}
                empty="Belum ada prestasi. Klik Tambah prestasi untuk memulai."
                onMove={moveAchievementAction}
                onToggleVisible={setAchievementVisibleAction}
                onDelete={deleteAchievementAction}
                renderEdit={(id, title) => {
                    const row = byId.get(id);
                    if (!row) return null;
                    return (
                        <FormDialog
                            title="Ubah prestasi"
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
                                <AchievementForm
                                    id={id}
                                    initial={toAchievementValues(row, today)}
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
