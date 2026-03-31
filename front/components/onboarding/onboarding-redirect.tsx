'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';

export function OnboardingRedirect() {
	const { user, isOnboarded, needsRegistration, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) {
			return;
		}

		if (needsRegistration) {
			router.push('/register');

			return;
		}

		if (!user) {
			router.push('/login');

			return;
		}

		if (!isOnboarded) {
			router.push('/onboarding/role');

			return;
		}

		router.push('/dashboard');
	}, [user, isOnboarded, needsRegistration, isLoading, router]);

	return null;
}
