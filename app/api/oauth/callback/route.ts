import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/settings?error=no_code', request.url));
    }

    const CLIENT_ID = process.env.LINUX_DO_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINUX_DO_CLIENT_SECRET;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`;

    if (!CLIENT_ID || !CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
        return NextResponse.redirect(new URL('/settings?error=config_missing', request.url));
    }

    try {
        // 1. Exchange code for token
        const tokenResponse = await fetch('https://connect.linux.do/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            throw new Error('Failed to get access token');
        }

        // 2. Get User Info
        const userResponse = await fetch('https://connect.linux.do/api/user', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = await userResponse.json();

        // 3. Redirect with data
        const redirectUrl = new URL('/settings', request.url);
        redirectUrl.searchParams.set('auth_success', 'true');
        redirectUrl.searchParams.set('token', tokenData.access_token);
        redirectUrl.searchParams.set('user', JSON.stringify(userData));

        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        console.error('OAuth Error:', error);
        return NextResponse.redirect(new URL('/settings?error=auth_failed', request.url));
    }
}
