import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/auth/require-admin";
import { PATHNAME_PATTERN, rulesFor } from "@/lib/media-rules";

const payloadSchema = z.object({ kind: z.enum(["image", "pdf"]) });

// Rute ini di luar matcher proxy.ts (hanya /admin/*), jadi harus memeriksa login sendiri
export async function POST(request: Request) {
    const admin = await getAdmin();
    if (!admin) {
        return NextResponse.json(
            { error: "Tidak diizinkan." },
            { status: 401 },
        );
    }

    let body: HandleUploadBody;
    try {
        body = (await request.json()) as HandleUploadBody;
    } catch {
        return NextResponse.json(
            { error: "Permintaan tidak valid." },
            { status: 400 },
        );
    }

    try {
        const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                if (!PATHNAME_PATTERN.test(pathname)) {
                    throw new Error("Nama file tidak valid.");
                }

                let payload: z.infer<typeof payloadSchema>;
                try {
                    payload = payloadSchema.parse(
                        JSON.parse(clientPayload ?? "{}"),
                    );
                } catch {
                    throw new Error("Jenis file tidak valid.");
                }

                const folder =
                    payload.kind === "image" ? "images/" : "documents/";
                if (!pathname.startsWith(folder)) {
                    throw new Error("Folder tidak sesuai jenis file.");
                }

                const rules = rulesFor(payload.kind);
                return {
                    allowedContentTypes: rules.allowedTypes,
                    maximumSizeInBytes: rules.maxBytes,
                    addRandomSuffix: true,
                };
            },
        });
        return NextResponse.json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Upload gagal.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
