import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;

    // Admin routes require superadmin
    if (pathname.startsWith("/admin") && !req.nextauth.token?.isSuperAdmin) {
      return NextResponse.rewrite(new URL("/denied", req.url));
    }

    // Authenticated users are redirected away from auth pages
    const isAuthPage =
      pathname.startsWith("/ingresar") || pathname.startsWith("/registro");
    if (isAuthPage && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Auth pages are always accessible (unauthenticated users may visit them)
        if (
          pathname.startsWith("/ingresar") ||
          pathname.startsWith("/registro")
        ) {
          return true;
        }
        // All other matched routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/ingresar", "/registro/:path*", "/admin/:path*"],
};
