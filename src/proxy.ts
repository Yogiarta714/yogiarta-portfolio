import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Sama dengan SESSION_COOKIE di lib/auth/session.ts. Diduplikasi karena file
// itu memakai server-only dan tidak boleh diimpor dari sini.
const SESSION_COOKIE = "session";

export function proxy(request: NextRequest) {
    const isLoginPage = request.nextUrl.pathname === "/admin/login";

    if (!isLoginPage && !request.cookies.has(SESSION_COOKIE)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("X-Frame-Options", "DENY");
    return response;
}

export const config = {
    matcher: ["/admin/:path*"],
};
