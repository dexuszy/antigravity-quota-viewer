import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const CLIENT_ID = env.CLIENT_ID || '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:5173/auth/callback'; // Adjust port if needed, or use env var

export const GET = async () => {
    if (!CLIENT_ID) {
        return new Response('CLIENT_ID not configured', { status: 500 });
    }

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/cloud-platform',
        access_type: 'offline',
        prompt: 'consent'
    });

    throw redirect(302, `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
