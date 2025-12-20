import { env } from '$env/dynamic/private';

export const load = async ({ cookies }) => {
    const hasRefreshToken = !!(env.REFRESH_TOKEN || cookies.get('refresh_token'));
    return {
        hasRefreshToken
    };
};
