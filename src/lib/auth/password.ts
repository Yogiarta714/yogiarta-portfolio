import bcrypt from "bcryptjs";

const COST = 12;

export function hashPassword(password: string) {
    return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

// Dipakai saat email tidak ditemukan
let dummyHash: Promise<string> | undefined;
export function getDummyHash() {
    dummyHash ??= bcrypt.hash("password-pura-pura", COST);
    return dummyHash;
}
