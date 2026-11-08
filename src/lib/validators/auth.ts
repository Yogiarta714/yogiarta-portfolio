import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, "Email wajib diisi.")
        .max(254, "Email terlalu panjang.")
        .email("Format email tidak valid."),
    password: z
        .string()
        .min(1, "Password wajib diisi.")
        .max(200, "Password terlalu panjang."),
});
