'use client';

import Link from 'next/link';

import { Activity, BarChart3, Building2, FileText, Shield, Stethoscope, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentStatus, type Appointment, type Structure } from '@/lib/types';

interface AdminDashboardProps {
	appointments: Appointment[];
	structures: Structure[];
}

export function AdminDashboard({ appointments, structures }: AdminDashboardProps) {
	const stats = [
		{
			title: 'Structures',
			value: structures.length,
			icon: Building2,
			color: 'text-primary',
			bgColor: 'bg-primary/10',
			trend: '',
			href: '/dashboard/structures',
		},
		{
			title: 'Professionnels',
			value: new Set(appointments.map((a) => a.HealthcareProfessionalId)).size,
			icon: Stethoscope,
			color: 'text-[hsl(var(--accent))]',
			bgColor: 'bg-[hsl(var(--accent))]/10',
			trend: '',
			href: '/dashboard/professionals',
		},
		{
			title: 'Patients',
			value: new Set(appointments.map((a) => a.PatientId)).size,
			icon: Users,
			color: 'text-[hsl(var(--success))]',
			bgColor: 'bg-[hsl(var(--success))]/10',
			trend: '',
			href: '/dashboard/patients',
		},
		{
			title: 'Rendez-vous',
			value: appointments.length,
			icon: FileText,
			color: 'text-[hsl(var(--warning))]',
			bgColor: 'bg-[hsl(var(--warning))]/10',
			trend: '',
			href: '/dashboard/prescriptions',
		},
	];

	const recentActivity = [
		{ type: 'structure', action: 'Nouvelle structure inscrite', name: 'Clinique Santé Paris', time: 'Il y a 2h' },
		{ type: 'professional', action: 'Nouveau professionnel', name: 'Dr. Sophie Laurent', time: 'Il y a 5h' },
		{ type: 'prescription', action: 'Prescription créée', name: 'Marie Dupont', time: 'Il y a 1 jour' },
		{ type: 'patient', action: 'Nouveau patient inscrit', name: 'Jean Martin', time: 'Il y a 2 jours' },
	];

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'structure': {
				return Building2;
			}

			case 'professional': {
				return Stethoscope;
			}

			case 'prescription': {
				return FileText;
			}

			case 'patient': {
				return Users;
			}

			default: {
				return Activity;
			}
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case 'structure': {
				return 'bg-primary/10 text-primary';
			}

			case 'professional': {
				return 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]';
			}

			case 'prescription': {
				return 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]';
			}

			case 'patient': {
				return 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
			}

			default: {
				return 'bg-muted text-muted-foreground';
			}
		}
	};

	return (
		<div className="space-y-6">
			{/* Welcome Banner */}
			<Card className="bg-primary text-primary-foreground border-0 shadow-sm">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="mb-2 text-2xl font-bold">Panneau d'administration</h2>
							<p className="text-primary-foreground/80">
								Gérez l'ensemble des utilisateurs, structures et prescriptions de la plateforme.
							</p>
						</div>

						<Shield className="text-primary-foreground/20 h-16 w-16" />
					</div>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Link key={stat.title} href={stat.href}>
						<Card className="h-full cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md">
							<CardContent className="p-5">
								<div className="flex items-start justify-between">
									<div className={`rounded-xl p-3 ${stat.bgColor}`}>
										<stat.icon className={`h-5 w-5 ${stat.color}`} />
									</div>

									<span className="text-muted-foreground flex items-center gap-1 text-xs">
										<TrendingUp className="h-3 w-3" />
										{stat.trend}
									</span>
								</div>

								<div className="mt-3">
									<p className="text-foreground text-2xl font-bold">{stat.value}</p>
									<p className="text-muted-foreground text-sm">{stat.title}</p>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Activité récente</CardTitle>
						<CardDescription>Dernières actions sur la plateforme</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{recentActivity.map((activity, index) => {
							const Icon = getActivityIcon(activity.type);

							return (
								<div key={index} className="hover:bg-muted/50 flex items-center gap-4 rounded-lg p-3 transition-colors">
									<div className={`rounded-lg p-2 ${getActivityColor(activity.type)}`}>
										<Icon className="h-4 w-4" />
									</div>

									<div className="min-w-0 flex-1">
										<p className="text-foreground text-sm font-medium">{activity.action}</p>
										<p className="text-muted-foreground text-xs">{activity.name}</p>
									</div>
									<span className="text-muted-foreground text-xs whitespace-nowrap">{activity.time}</span>
								</div>
							);
						})}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="text-lg">Vue d'ensemble</CardTitle>
						<CardDescription>Statistiques globales de la plateforme</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-muted/50 rounded-lg p-4 text-center">
								<BarChart3 className="text-primary mx-auto mb-2 h-6 w-6" />
								<p className="text-foreground text-2xl font-bold">{appointments.length}</p>
								<p className="text-muted-foreground text-xs">Total rendez-vous</p>
							</div>

							<div className="bg-muted/50 rounded-lg p-4 text-center">
								<Activity className="mx-auto mb-2 h-6 w-6 text-[hsl(var(--success))]" />
								<p className="text-foreground text-2xl font-bold">
									{appointments.filter((a) => a.Status === AppointmentStatus.PERFORMED).length}
								</p>
								<p className="text-muted-foreground text-xs">Actes validés</p>
							</div>
						</div>

						<div className="space-y-3">
							<h4 className="text-foreground text-sm font-medium">Structures actives</h4>

							{structures.map((structure) => (
								<div
									key={structure.Id}
									className="border-border flex items-center justify-between rounded-lg border p-3"
								>
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 rounded-lg p-2">
											<Building2 className="text-primary h-4 w-4" />
										</div>

										<div>
											<p className="text-foreground text-sm font-medium">{structure.Name}</p>
											<p className="text-muted-foreground text-xs">{structure.Address}</p>
										</div>
									</div>

									<Badge variant="secondary" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
										Active
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">Gestion rapide</CardTitle>
					<CardDescription>Accès direct aux sections principales</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<Link href="/dashboard/structures">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-4">
								<Building2 className="text-primary h-5 w-5" />
								<span className="text-sm">Gérer les structures</span>
							</Button>
						</Link>

						<Link href="/dashboard/professionals">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-4">
								<Stethoscope className="text-primary h-5 w-5" />
								<span className="text-sm">Gérer les professionnels</span>
							</Button>
						</Link>

						<Link href="/dashboard/patients">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-4">
								<Users className="text-primary h-5 w-5" />
								<span className="text-sm">Gérer les patients</span>
							</Button>
						</Link>

						<Link href="/dashboard/prescriptions">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-4">
								<FileText className="text-primary h-5 w-5" />
								<span className="text-sm">Voir les prescriptions</span>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
