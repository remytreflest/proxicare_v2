import { NextResponse, type NextRequest } from 'next/server';

import { auth0 } from '@/lib/auth0';

const PUBLIC_ROUTES = new Set(['/', '/login']);

export async function middleware(request: NextRequest) {
	const authResponse = await auth0.middleware(request);

	if (request.nextUrl.pathname.startsWith('/auth')) {
		return authResponse;
	}

	if (PUBLIC_ROUTES.has(request.nextUrl.pathname)) {
		return authResponse;
	}

	const session = await auth0.getSession(request);

	if (!session) {
		const { origin } = new URL(request.url);

		return NextResponse.redirect(`${origin}/auth/login?returnTo=${encodeURIComponent(request.nextUrl.pathname)}`);
	}

	return authResponse;
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
