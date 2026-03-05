'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
	Building2,
	Calendar,
	ChevronRight,
	FileText,
	Heart,
	LayoutDashboard,
	LogOut,
	Menu,
	QrCode,
	User,
	X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { UserRole, User as UserType } from '@/lib/types';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<UserRole, string> = {
	professional: 'Professionnel',
	structure: 'Structure',
	admin: 'Administrateur',
	patient: 'Patient',
};

const navigationItems = {
	patient: [
		{ name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Mes prescriptions', href: '/dashboard/prescriptions', icon: FileText },
		{ name: 'Mes rendez-vous', href: '/dashboard/appointments', icon: Calendar },
		{ name: 'Validation QR', href: '/dashboard/qr-validation', icon: QrCode },
		{ name: 'Mon profil', href: '/dashboard/profile', icon: User },
	],
	professional: [
		{ name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
		{ name: 'Planning', href: '/dashboard/appointments', icon: Calendar },
		// { name: 'Mes patients', href: '/dashboard/patients', icon: Users },
		// { name: 'Mes actes', href: '/dashboard/acts', icon: Stethoscope },
		{ name: 'Mon profil', href: '/dashboard/profile', icon: User },
	],
	structure: [
		{ name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
		{ name: 'Rendez-vous', href: '/dashboard/appointments', icon: Calendar },
		// { name: 'Patients', href: '/dashboard/patients', icon: Users },
		// { name: 'Professionnels', href: '/dashboard/professionals', icon: Stethoscope },
		{ name: 'Profil structure', href: '/dashboard/profile', icon: Building2 },
	],
	admin: [
		{ name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
		{ name: 'Structures', href: '/dashboard/structures', icon: Building2 },
		// { name: 'Professionnels', href: '/dashboard/professionals', icon: Stethoscope },
		// { name: 'Patients', href: '/dashboard/patients', icon: Users },
		{ name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
		// { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
	],
};

interface DashboardSidebarProps {
	user: UserType;
	role: UserRole;
}

export function DashboardSidebar({ user, role }: DashboardSidebarProps) {
	const pathname = usePathname();

	const [isMobileOpen, setIsMobileOpen] = useState(false);

	function NavContent() {
		return (
			<>
				<div className="border-sidebar-border flex items-center gap-3 border-b px-4 py-6">
					<div className="bg-primary/10 rounded-xl p-2">
						<Heart className="text-primary h-6 w-6" />
					</div>

					<span className="text-sidebar-foreground text-xl font-bold">Proxicare</span>
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
					{navigationItems[role].map((item) => {
						const isActive = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsMobileOpen(false)}
								className={cn(
									'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
									isActive
										? 'bg-sidebar-accent text-sidebar-accent-foreground'
										: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
								)}
							>
								<item.icon className="h-5 w-5" />
								{item.name}
								{isActive && <ChevronRight className="ml-auto h-4 w-4" />}
							</Link>
						);
					})}
				</nav>

				<div className="border-sidebar-border border-t p-4">
					<div className="mb-4 flex items-center gap-3">
						<div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
							<span className="text-primary text-sm font-semibold">
								{user.FirstName[0]}
								{user.LastName[0]}
							</span>
						</div>

						<div className="min-w-0 flex-1">
							<p className="text-sidebar-foreground truncate text-sm font-medium">
								{user.FirstName} {user.LastName}
							</p>
							<p className="text-sidebar-foreground/60 truncate text-xs capitalize">{ROLE_LABELS[role]}</p>
						</div>
					</div>

					<Button
						variant="ghost"
						className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 w-full justify-start"
						render={
							<a href="/auth/logout" className="w-full">
								<LogOut className="mr-2 h-4 w-4" />
								Déconnexion
							</a>
						}
						nativeButton={false}
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<button
				type="button"
				className="bg-card fixed top-4 left-4 z-50 rounded-lg p-2 shadow-md lg:hidden"
				onClick={() => setIsMobileOpen(!isMobileOpen)}
			>
				{isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</button>

			{isMobileOpen && (
				<div
					className="bg-foreground/20 fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			<aside
				className={cn(
					'bg-sidebar-background fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col transition-transform duration-300 lg:hidden',
					isMobileOpen ? 'translate-x-0' : '-translate-x-full',
				)}
			>
				<NavContent />
			</aside>

			<aside className="bg-sidebar-background border-sidebar-border fixed inset-y-0 left-0 hidden w-64 flex-col border-r lg:flex">
				<NavContent />
			</aside>
		</>
	);
}
