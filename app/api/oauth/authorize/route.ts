import { redirect } from 'next/navigation';

export async function GET() {
    const CLIENT_ID = process.env.LINUX_DO_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`;

    if (!CLIENT_ID || !process.env.NEXT_PUBLIC_APP_URL) {
        return new Response('Missing configuration', { status: 500 });
    }

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'user', // As per user guide
    });

    redirect(`https://connect.linux.do/oauth2/authorize?${params.toString()}`);
}
