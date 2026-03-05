'use client';

import type { ComponentProps, ReactNode } from 'react';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';

import { AuthProvider } from '@/lib/auth-context';

type Auth0User = ComponentProps<typeof Auth0Provider>['user'];

export function Providers({ children, auth0User }: { children: ReactNode; auth0User: Auth0User }) {
	return (
		<Auth0Provider user={auth0User}>
			<AuthProvider>{children}</AuthProvider>
		</Auth0Provider>
	);
}
