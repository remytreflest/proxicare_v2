import { auth0 } from '@/lib/auth0';

export const GET = async (request: Request) => {
	return auth0.middleware(request);
};

export const POST = async (request: Request) => {
	return auth0.middleware(request);
};
