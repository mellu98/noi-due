import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Auth is handled client-side via localStorage (cross-domain cookie limitation).
  // We no longer verify auth in middleware because Supabase session lives in
  // localStorage, not cookies, and cannot be read server-side.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
