export async function POST({ request, params, url, cookies }) {
    const path = params.path;
    const targetUrl = `https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:${path}`;
    const accessToken = cookies.get('access_token');

    console.log('Proxying Models Request:', request.method, url.pathname, '->', targetUrl);

    if (!accessToken) {
        console.warn('Warning: No access token available in cookies for proxy request.');
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('User-Agent', 'antigravity/1.11.2 darwin/arm64');
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    try {
        const body = await request.text();
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body
        });

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
