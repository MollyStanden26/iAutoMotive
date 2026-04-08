// Session management is now handled by:
// - JWT signing/verification: src/lib/auth/jwt.ts
// - HTTP-only cookie set by API routes (Set-Cookie header)
// - Middleware reads cookie via jose jwtVerify
// - Client hydration via GET /api/auth/me
//
// This file is kept as a placeholder. No client-side cookie
// manipulation is needed with HTTP-only JWT cookies.

export {};
