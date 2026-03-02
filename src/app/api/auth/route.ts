import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
const APP_PASSWORD = process.env.APP_PASSWORD || 'kerim123';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (password !== APP_PASSWORD) {
            return NextResponse.json({ error: 'Hatalı şifre' }, { status: 401 });
        }

        const token = await new SignJWT({ authenticated: true })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        const response = NextResponse.json({ success: true });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: 'Giriş yapılamadı' }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');
    return response;
}
