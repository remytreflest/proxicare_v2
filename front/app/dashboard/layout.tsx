import React from 'react';
import { redirect } from 'next/navigation';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { auth0 } from '@/lib/auth0';
import { serverTryFetchUser } from '@/lib/server-api';
import { getUserRole } from '@/lib/utils';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth0.getSession();

	if (!session) {
		redirect('/auth/login?returnTo=/dashboard');
	}

	const user = await serverTryFetchUser();

	if (!user) {
		redirect('/register');
	}

	const role = getUserRole(user);

	const isOnboarded = !!user.Patient || !!user.HealthcareProfessional;

	if (!isOnboarded && role !== 'admin') {
		redirect('/onboarding');
	}

	return (
		<div className="bg-background min-h-screen">
			<DashboardSidebar user={user} role={role} />

			<div className="lg:pl-64">
				<DashboardHeader user={user} />

				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}
