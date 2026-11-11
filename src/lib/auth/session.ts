import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

const key = new TextEncoder().encode(env.AUTH_SECRET);

export type SessionPayload = {
    adminId: string;
    sessionVersion: number;
};

export async function createSessionToken(payload: SessionPayload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function verifySessionToken(
    token: string | undefined,
): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        if (
            typeof payload.adminId !== "string" ||
            typeof payload.sessionVersion !== "number"
        ) {
            return null;
        }
        return {
            adminId: payload.adminId,
            sessionVersion: payload.sessionVersion,
        };
    } catch {
        return null; // tanda tangan salah, token kedaluwarsa, atau rusak
    }
}

export async function setSessionCookie(payload: SessionPayload) {
    const token = await createSessionToken(payload);
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: MAX_AGE_SECONDS,
    });
}

export async function clearSessionCookie() {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
}

export async function readSessionCookie() {
    const store = await cookies();
    return store.get(SESSION_COOKIE)?.value;
}
