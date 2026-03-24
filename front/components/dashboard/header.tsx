'use client';

import { usePathname } from 'next/navigation';

import type { User } from '@/lib/types';

const pageTitles: Record<string, string> = {
	'/dashboard': 'Tableau de bord',
	'/dashboard/prescriptions': 'Prescriptions',
	'/dashboard/appointments': 'Rendez-vous',
	'/dashboard/qr-validation': 'Validation QR Code',
	'/dashboard/profile': 'Mon profil',
	'/dashboard/patients': 'Patients',
	'/dashboard/professionals': 'Professionnels',
	'/dashboard/acts': 'Mes actes',
	'/dashboard/structures': 'Structures',
	'/dashboard/settings': 'Paramètres',
};

interface DashboardHeaderProps {
	user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
	const pathname = usePathname();

	const title = pageTitles[pathname] || 'Tableau de bord';

	const getGreeting = () => {
		const hour = new Date().getHours();

		if (hour < 12) {
			return 'Bonjour';
		}

		if (hour < 18) {
			return 'Bon après-midi';
		}

		return 'Bonsoir';
	};

	return (
		<header className="bg-background/95 supports-backdrop-filter:bg-background/60 border-border sticky top-0 z-30 border-b backdrop-blur">
			<div className="flex items-center justify-between px-6 py-4">
				<div className="pl-12 lg:pl-0">
					<h1 className="text-foreground text-xl font-semibold">{title}</h1>

					{pathname === '/dashboard' && (
						<p className="text-muted-foreground text-sm">
							{getGreeting()}, {user.FirstName}
						</p>
					)}
				</div>
			</div>
		</header>
	);
}
