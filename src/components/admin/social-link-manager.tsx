"use client";

import {
    deleteSocialLinkAction,
    moveSocialLinkAction,
    setSocialLinkVisibleAction,
} from "@/actions/social-links";
import { FormDialog } from "@/components/admin/form-dialog";
import { ItemList, type ListItem } from "@/components/admin/item-list";
import { SocialLinkForm } from "@/components/admin/social-link-form";
import { Button } from "@/components/ui/button";
import type { SocialLinkRow } from "@/lib/admin-queries/social-links";
import { toSocialLinkValues } from "@/lib/social-links-form";
import { SOCIAL_PLATFORMS } from "@/lib/validators/social-links";

const platformName = (value: string) =>
    SOCIAL_PLATFORMS.find((p) => p.value === value)?.label ?? value;

export function SocialLinkManager({ items }: { items: SocialLinkRow[] }) {
    const byId = new Map(items.map((row) => [row.id, row]));

    const listItems: ListItem[] = items.map((row) => ({
        id: row.id,
        title: platformName(row.platform),
        subtitle: row.label,
        meta: row.url,
        visible: row.isVisible,
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">
                    {items.length} tautan. Urutan di sini adalah urutan di
                    situs.
                </p>
                <FormDialog
                    title="Tambah tautan"
                    trigger={(open) => (
                        <Button type="button" onClick={open}>
                            Tambah tautan
                        </Button>
                    )}
                >
                    {(close) => (
                        <SocialLinkForm
                            id={null}
                            initial={toSocialLinkValues(null)}
                            onDone={close}
                        />
                    )}
                </FormDialog>
            </div>

            <ItemList
                items={listItems}
                empty="Belum ada tautan. Klik Tambah tautan untuk memulai."
                onMove={moveSocialLinkAction}
                onToggleVisible={setSocialLinkVisibleAction}
                onDelete={deleteSocialLinkAction}
                renderEdit={(id, title) => {
                    const row = byId.get(id);
                    if (!row) return null;
                    return (
                        <FormDialog
                            title="Ubah tautan"
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
                                <SocialLinkForm
                                    id={id}
                                    initial={toSocialLinkValues(row)}
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
