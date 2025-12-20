import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ cookies, url }) {
    let refreshToken = env.REFRESH_TOKEN || cookies.get('refresh_token');

    if (!refreshToken) {
        return json({ error: 'Missing refresh token. Please sign in.' }, { status: 401 });
    }

    const clientId = env.CLIENT_ID || '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
    const clientSecret = env.CLIENT_SECRET || "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";

    try {
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Failed to refresh token');
        }

        const data = await response.json();

        cookies.set('access_token', data.access_token, {
            path: '/',
            httpOnly: true,
            secure: url.protocol === 'https:',
            sameSite: 'lax',
            maxAge: data.expires_in || 3600
        });

        console.log('Access Token refreshed and stored in cookies.');
        return json({ success: true });
    } catch (error) {
        console.error('Token refresh error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
