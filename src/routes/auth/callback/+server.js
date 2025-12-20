import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const CLIENT_ID = env.CLIENT_ID || '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const CLIENT_SECRET = env.CLIENT_SECRET || "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";
const REDIRECT_URI = 'http://localhost:5173/auth/callback';

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
        return new Response(`OAuth Error: ${error}`, { status: 400 });
    }

    if (!code) {
        return new Response('Missing code', { status: 400 });
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI
            })
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            return new Response(`Token Error: ${tokens.error_description || tokens.error}`, { status: 400 });
        }

        if (tokens.refresh_token) {
            cookies.set('refresh_token', tokens.refresh_token, {
                path: '/',
                httpOnly: true,
                secure: url.protocol === 'https:',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
        }

        if (tokens.access_token) {
            cookies.set('access_token', tokens.access_token, {
                path: '/',
                httpOnly: true,
                secure: url.protocol === 'https:',
                sameSite: 'lax',
                maxAge: tokens.expires_in || 3600
            });
        }

        throw redirect(302, '/');
    } catch (err) {
        if (err.status === 302) throw err;
        return new Response(`Internal Error: ${err.message}`, { status: 500 });
    }
};
