import { createInterface } from "node:readline/promises";

export async function askText(question: string): Promise<string> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        return await rl.question(question);
    } finally {
        rl.close();
    }
}

export async function confirm(question: string): Promise<boolean> {
    const answer = await askText(`${question} (ketik "ya" untuk lanjut): `);
    return answer.trim().toLowerCase() === "ya";
}

// karakter tidak ditampilkan di layar
export function askHidden(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const stdin = process.stdin;
        if (!stdin.isTTY) {
            reject(
                new Error("Skrip ini harus dijalankan di terminal interaktif."),
            );
            return;
        }
        process.stdout.write(prompt);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");
        let value = "";

        const finish = () => {
            stdin.setRawMode(false);
            stdin.pause();
            stdin.off("data", onData);
            process.stdout.write("\n");
        };

        const onData = (chunk: string) => {
            for (const char of chunk) {
                if (char === "\r" || char === "\n" || char === "\u0004") {
                    finish();
                    resolve(value);
                    return;
                }
                if (char === "\u0003") {
                    finish();
                    process.exit(130); // Ctrl+C
                }
                if (char === "\u007f" || char === "\b") {
                    value = value.slice(0, -1);
                    continue;
                }
                value += char;
            }
        };

        stdin.on("data", onData);
    });
}
