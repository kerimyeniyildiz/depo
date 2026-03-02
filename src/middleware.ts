import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect dashboard and api routes EXCEPT api/auth
    const isProtectedRoute = pathname.startsWith('/dashboard') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth'));
    const token = request.cookies.get('auth-token')?.value;

    if (isProtectedRoute) {
        if (!token) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If going to login page but already authenticated, redirect to dashboard
    if (pathname === '/login' || pathname === '/') {
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (error) {
                // Token invalid, let them proceed to login/home
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'], // Match all paths except static files
};
