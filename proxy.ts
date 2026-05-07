import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth, res) {
    if (
      // auth creado para probar el rol
      //req.nextUrl.pathname.startsWith("/admin") &&
      req.nextUrl.pathname.startsWith("/dashboard") &&
      req.nextauth.token?.role !== "SUPERADMIN"
    ) {
      return NextResponse.rewrite(new URL("/denied", req.url));
    }

    // if (
    //   //reemplazar por las webs protegidas si las hay

    //   (req.nextUrl.pathname.startsWith("/bienvenido") ||
    //     req.nextUrl.pathname.startsWith("/finalizado") ||
    //     req.nextUrl.pathname.startsWith("/estado")) &&
    //   req.nextauth.token?.role !== "SELLER"
    // ) {
    //   return NextResponse.rewrite(new URL('/dashboard', req.url))
    // }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [],
};
