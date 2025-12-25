import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_USER = 'planseeker1132@gmail.com';
const ADMIN_PASS = '727441';

export async function POST(request: Request) {
    const { username, password } = await request.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const response = NextResponse.json({ success: true });

        // Set a simple auth cookie
        (await cookies()).set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
