import React from 'react';
import { redirect } from 'next/navigation';

import { auth0 } from '@/lib/auth0';

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
	const session = await auth0.getSession();

	if (!session) {
		redirect('/auth/login?returnTo=/register');
	}

	return (
		<div className="bg-background min-h-screen">
			<header className="border-border bg-card border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-2">
						<div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
							<span className="text-primary-foreground text-sm font-bold">P</span>
						</div>
						<span className="text-foreground text-xl font-semibold">Proxicare</span>
					</div>
				</div>
			</header>

			<main>{children}</main>
		</div>
	);
}
