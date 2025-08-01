import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ✅ Public paths ที่ไม่ต้อง login
const publicPaths = [
  "/",
  "/unauthorized",
  "/viewprofile",
  "/editprofile",
  "/changepassword",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ 1. Allow public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ 2. Read token from cookie
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload } = await jwtVerify(token, secret);
    const roleId = payload.roleId as number;

    // ✅ 3. RBAC Path Mapping
    const superAdminPaths = ["/role", "/user/superadmin"];
    const adminPaths = [
      "/branch",
      "/company",
      "/contract",
      "/fueltype",
      "/owner",
      "/power",
      "/region",
      "/user/admin",
      "/voltage",
    ];
    const edlPaths = ["/alldocument/edl", "/dispatch"];
    const powerPaths = ["/alldocument/power", "/declaration"];
    const togetherPaths = ["/dashboard", "/report"];

    const isDenied =
      (matchPath(pathname, superAdminPaths) && roleId !== 1) ||
      (matchPath(pathname, adminPaths) && roleId !== 2) ||
      (matchPath(pathname, edlPaths) && ![3, 4].includes(roleId)) ||
      (matchPath(pathname, powerPaths) && ![5, 6].includes(roleId)) ||
      (matchPath(pathname, togetherPaths) && ![3, 4, 5, 6].includes(roleId));

    if (isDenied) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // ✅ Attach role to header if needed
    const response = NextResponse.next();
    response.headers.set("x-user-role", String(roleId));
    return response;
  } catch (err) {
    console.error("❌ JWT Verify Error:", err);
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
}

// ✅ Helper: Exact path matching or prefix match with /
function matchPath(pathname: string, protectedPaths: string[]) {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export const config = {
  matcher: [
    "/role/:path*",
    "/user/superadmin/:path*",
    "/user/admin/:path*",
    "/branch/:path*",
    "/company/:path*",
    "/contract/:path*",
    "/fueltype/:path*",
    "/owner/:path*",
    "/power/:path*",
    "/region/:path*",
    "/voltage/:path*",
    "/alldocument/:path*",
    "/dispatch/:path*",
    "/declaration/:path*",
    "/dashboard/:path*",
    "/report/:path*",
  ],
};
