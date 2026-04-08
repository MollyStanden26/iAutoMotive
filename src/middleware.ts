import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Inline types — cannot use @/ aliases reliably in Edge middleware
type UserRole =
  | "super-admin"
  | "site-manager"
  | "finance"
  | "sales"
  | "recon-tech"
  | "compliance"
  | "read-only"
  | "seller"
  | "buyer"
  | "dealer";

const STAFF_ROLES: UserRole[] = [
  "super-admin",
  "site-manager",
  "finance",
  "sales",
  "recon-tech",
  "compliance",
  "read-only",
];

const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  "super-admin": "/admin",
  "site-manager": "/admin",
  finance: "/admin",
  sales: "/admin",
  "recon-tech": "/admin",
  compliance: "/admin",
  "read-only": "/admin",
  seller: "/seller/overview",
  buyer: "/account",
  dealer: "/dealer",
};

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

async function getSessionUser(
  request: NextRequest
): Promise<SessionUser | null> {
  const cookie = request.cookies.get("ac-session");
  if (!cookie?.value) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      cookie.value,
      new TextEncoder().encode(secret)
    );
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      emailVerified: payload.emailVerified as boolean,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getSessionUser(request);

  // --- Auth pages: redirect authenticated users to their dashboard ---
  if (pathname.startsWith("/auth")) {
    if (pathname.startsWith("/auth/signout")) return NextResponse.next();
    if (user) {
      return NextResponse.redirect(
        new URL(ROLE_HOME_ROUTE[user.role], request.url)
      );
    }
    return NextResponse.next();
  }

  // --- Protected routes: require authentication ---
  const protectedPrefixes = [
    "/admin",
    "/portal",
    "/dealer",
    "/account",
    "/checkout",
  ];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  // Not authenticated → redirect to signin with redirect param
  if (!user) {
    const signinUrl = new URL("/auth/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // /admin → must be staff role
  if (pathname.startsWith("/admin")) {
    if (!STAFF_ROLES.includes(user.role)) {
      return NextResponse.redirect(
        new URL(ROLE_HOME_ROUTE[user.role], request.url)
      );
    }
  }

  // /portal → must be seller (or super-admin)
  if (pathname.startsWith("/portal")) {
    if (user.role !== "seller" && user.role !== "super-admin") {
      return NextResponse.redirect(
        new URL(ROLE_HOME_ROUTE[user.role], request.url)
      );
    }
  }

  // /dealer → must be dealer (or super-admin)
  if (pathname.startsWith("/dealer")) {
    if (user.role !== "dealer" && user.role !== "super-admin") {
      return NextResponse.redirect(
        new URL(ROLE_HOME_ROUTE[user.role], request.url)
      );
    }
  }

  // /account → must be buyer (or super-admin)
  if (pathname.startsWith("/account")) {
    if (user.role !== "buyer" && user.role !== "super-admin") {
      return NextResponse.redirect(
        new URL(ROLE_HOME_ROUTE[user.role], request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/dealer/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/auth/:path*",
  ],
};
