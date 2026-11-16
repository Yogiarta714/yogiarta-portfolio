"use client";

import { deleteMediaAction } from "@/actions/media";
import { ConfirmDelete } from "@/components/admin/confirm-delete";

export function DeleteMediaButton({ id, name }: { id: string; name: string }) {
    return (
        <ConfirmDelete
            name={name}
            description="File dihapus permanen dari penyimpanan. Penghapusan ditolak kalau file masih dipakai."
            action={() => deleteMediaAction(id)}
        />
    );
}
