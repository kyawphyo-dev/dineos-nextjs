import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type StaffRole = "owner" | "manager" | "front_staff" | "kitchen" | "cashier";

const ROUTE_RULES: { prefix: string; allow: StaffRole[]; restricted?: { path: string; disallow: StaffRole[] } }[] = [
  {
    prefix: "/admin",
    allow: ["owner", "manager"],
    restricted: {
      path: "/admin/reports/sales",
      disallow: ["manager"]
    }
  },
  { prefix: "/staff", allow: ["front_staff", "owner", "manager"] },
  { prefix: "/kitchen", allow: ["kitchen", "owner", "manager"] },
  { prefix: "/cashier", allow: ["cashier", "owner", "manager"] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rule = ROUTE_RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = token?.role as StaffRole | undefined;

  if (!role || !rule.allow.includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (rule.restricted && pathname === rule.restricted.path) {
    if (rule.restricted.disallow.includes(role)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/kitchen/:path*",
    "/cashier/:path*",
  ],
};
