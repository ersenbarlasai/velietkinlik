import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin rotalarını koruyan proxy (Next.js 16 convention).
 * /admin/giris hariç tüm /admin/* rotaları için cookie kontrolü yapar.
 * Cookie yoksa /admin/giris sayfasına yönlendirir.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/giris sayfası korunmaz (giriş formu)
  if (pathname === "/admin/giris") {
    return NextResponse.next();
  }

  // Admin session cookie kontrolü
  const adminSession = request.cookies.get("admin_session");

  if (!adminSession || adminSession.value !== "authenticated") {
    const loginUrl = new URL("/admin/giris", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
