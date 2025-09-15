import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const session = request.cookies.get("session")?.value;

    const isLoggedIn = !!session;

    const isLoginRoute =
        request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/register" ||
        request.nextUrl.pathname === "/forgotpassword";

    if (isLoggedIn && isLoginRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isLoggedIn && !isLoginRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
