'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

export function HomeRedirect() {
	const router = useRouter();
	const { isAuthenticated, needsRegistration } = useAuth();

	useEffect(() => {
		if (isAuthenticated) {
			if (needsRegistration) {
				router.push('/register');
			} else {
				router.push('/dashboard');
			}
		} else {
			router.push('/login');
		}
	}, [isAuthenticated, needsRegistration, router]);

	return (
		<div className="bg-background flex min-h-screen items-center justify-center">
			<div className="text-center">
				<Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
				<p className="text-muted-foreground">Chargement...</p>
			</div>
		</div>
	);
}
