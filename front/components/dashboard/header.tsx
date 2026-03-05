'use client';

import { usePathname } from 'next/navigation';

import { Bell, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

				<div className="flex items-center gap-4">
					<div className="relative hidden md:flex">
						<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
						<Input placeholder="Rechercher..." className="bg-muted/50 w-64 pl-9" />
					</div>

					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-5 w-5" />
						<span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
						<span className="sr-only">Notifications</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
