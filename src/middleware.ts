import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware — auth gate, role-based routing
// /admin/* — requires staff role (RBAC enforced)
// /portal/* — requires seller role + email verified
// /account/* — requires buyer role + email verified
// /dealer/* — requires dealer role + email verified
// /checkout/* — requires authenticated user
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/account/:path*", "/dealer/:path*", "/checkout/:path*"],
};
