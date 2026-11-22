"use client";

import type { ReactNode } from "react";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { MoveButtons } from "@/components/admin/move-buttons";
import { Badge, RowAction } from "@/components/admin/row-parts";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

export type ListItem = {
    id: string;
    title: string;
    subtitle?: string;
    meta?: string;
    visible: boolean;
    badges?: string[];
};

export function ItemList({
    items,
    empty,
    deleteDescription,
    onMove,
    onToggleVisible,
    onDelete,
    renderEdit,
}: {
    items: ListItem[];
    empty: string;
    deleteDescription?: string;
    onMove: (id: string, direction: "up" | "down") => Promise<ActionResult>;
    onToggleVisible: (id: string, visible: boolean) => Promise<ActionResult>;
    onDelete: (id: string) => Promise<ActionResult>;
    renderEdit: (id: string, title: string) => ReactNode;
}) {
    if (items.length === 0) {
        return (
            <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
                {empty}
            </div>
        );
    }

    return (
        <ul className="space-y-3">
            {items.map((item, index) => (
                <li
                    key={item.id}
                    className="bg-card border-border/60 flex flex-wrap items-start gap-4 rounded-2xl border p-4 shadow-sm"
                >
                    <div
                        className={cn(
                            "min-w-0 flex-1 basis-56 space-y-1.5",
                            !item.visible && "opacity-70",
                        )}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-sans text-base font-semibold">
                                {item.title}
                            </h3>
                            {item.badges?.map((label) => (
                                <Badge key={label} tone="muted">
                                    {label}
                                </Badge>
                            ))}
                            {!item.visible && (
                                <Badge tone="muted">Disembunyikan</Badge>
                            )}
                        </div>
                        {item.subtitle && (
                            <p className="text-muted-foreground text-sm">
                                {item.subtitle}
                            </p>
                        )}
                        {item.meta && (
                            <p className="text-muted-foreground font-mono text-xs">
                                {item.meta}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-start gap-1">
                        <MoveButtons
                            name={item.title}
                            canUp={index > 0}
                            canDown={index < items.length - 1}
                            onMove={(direction) => onMove(item.id, direction)}
                        />
                        <RowAction
                            label={item.visible ? "Sembunyikan" : "Tampilkan"}
                            ariaLabel={`${item.visible ? "Sembunyikan" : "Tampilkan"} ${item.title}`}
                            action={() =>
                                onToggleVisible(item.id, !item.visible)
                            }
                        />
                        {renderEdit(item.id, item.title)}
                        <ConfirmDelete
                            name={item.title}
                            description={deleteDescription}
                            action={() => onDelete(item.id)}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}
