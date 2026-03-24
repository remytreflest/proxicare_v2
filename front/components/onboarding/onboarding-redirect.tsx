'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { RolesEnum } from '@/lib/types';
import { hasRole } from '@/lib/utils';

export function OnboardingRedirect() {
	const { user, isOnboarded, needsRegistration } = useAuth();
	const router = useRouter();

	useEffect(() => {
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
	}, [user, isOnboarded, needsRegistration, router]);

	return null;
}
