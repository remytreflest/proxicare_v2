'use client';

import Link from 'next/link';

import {
	ArrowRight,
	Calendar,
	CheckCircle2,
	Clock,
	FileText,
	Plus,
	Stethoscope,
	TrendingUp,
	Users,
	XCircle,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppointmentStatus, PrescriptionHealthcareActStatus, type Appointment, type Prescription } from '@/lib/types';
import { getPrescriptionStatus } from '@/lib/utils';

interface StructureDashboardProps {
	appointments: Appointment[];
	prescriptions: Prescription[];
}

export function StructureDashboard({ appointments, prescriptions }: StructureDashboardProps) {
	const activePrescriptions = prescriptions.filter((prescription) => getPrescriptionStatus(prescription) === 'active');
	const totalAppointments = appointments.length;
	const completedAppointments = appointments.filter(
		(appointment) => appointment.Status === AppointmentStatus.PERFORMED,
	).length;
	const scheduledAppointments = appointments.filter(
		(appointment) => appointment.Status === AppointmentStatus.PLANNED,
	).length;

	const stats = [
		{
			title: 'Patients',
			value: new Set(appointments.map((appointment) => appointment.PatientId)).size,
			icon: Users,
			color: 'text-primary',
			bgColor: 'bg-primary/10',
			trend: '',
		},
		{
			title: 'Professionnels',
			value: new Set(appointments.map((appointment) => appointment.HealthcareProfessionalId)).size,
			icon: Stethoscope,
			color: 'text-[hsl(var(--accent))]',
			bgColor: 'bg-[hsl(var(--accent))]/10',
			trend: 'Actifs',
		},
		{
			title: 'Prescriptions actives',
			value: activePrescriptions.length,
			icon: FileText,
			color: 'text-[hsl(var(--success))]',
			bgColor: 'bg-[hsl(var(--success))]/10',
			trend: '+5 ce mois',
		},
		{
			title: 'Rendez-vous',
			value: scheduledAppointments,
			icon: Calendar,
			color: 'text-[hsl(var(--warning))]',
			bgColor: 'bg-[hsl(var(--warning))]/10',
			trend: 'À venir',
		},
	];

	const appointmentStats = [
		{ label: 'Validés', value: completedAppointments, color: 'bg-[hsl(var(--success))]', icon: CheckCircle2 },
		{ label: 'Planifiés', value: scheduledAppointments, color: 'bg-primary', icon: Clock },
		{
			label: 'Annulés',
			value: appointments.filter((appointment) => appointment.Status === AppointmentStatus.CANCELLED).length,
			color: 'bg-destructive',
			icon: XCircle,
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.title} className="border-0 shadow-sm">
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
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="border-0 shadow-sm lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-lg">Prescriptions récentes</CardTitle>
							<CardDescription>Dernières prescriptions créées</CardDescription>
						</div>

						<div className="flex gap-2">
							<Link href="/dashboard/prescriptions/new">
								<Button size="sm" className="gap-1">
									<Plus className="h-4 w-4" />
									Nouvelle
								</Button>
							</Link>

							<Link href="/dashboard/prescriptions">
								<Button variant="ghost" size="sm" className="text-primary">
									Voir tout <ArrowRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</CardHeader>

					<CardContent>
						<div className="space-y-4">
							{prescriptions.slice(0, 4).map((prescription) => {
								const acts = prescription.PrescriptionHealthcareActs ?? [];
								const progress =
									acts.length > 0
										? (acts.filter((a) => a.Status === PrescriptionHealthcareActStatus.PERFORMED).length /
												acts.length) *
											100
										: 0;
								const patientName = prescription.Patient?.User
									? `${prescription.Patient.User.FirstName} ${prescription.Patient.User.LastName}`
									: 'Patient';
								const status = getPrescriptionStatus(prescription);

								let statusClassName: string;

								switch (status) {
									case 'active': {
										statusClassName = 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
										break;
									}

									case 'completed': {
										statusClassName = 'bg-muted text-muted-foreground';
										break;
									}

									default: {
										statusClassName = 'bg-destructive/10 text-destructive';
									}
								}

								return (
									<div key={prescription.Id} className="border-border bg-card rounded-lg border p-4">
										<div className="mb-3 flex items-start justify-between">
											<div className="flex items-center gap-3">
												<Avatar className="h-9 w-9">
													<AvatarFallback className="bg-primary/10 text-primary text-xs">
														{patientName
															.split(' ')
															.map((n) => n[0])
															.join('')}
													</AvatarFallback>
												</Avatar>

												<div>
													<p className="text-foreground font-medium">{patientName}</p>
													<p className="text-muted-foreground text-xs">
														{acts.length} acte{acts.length > 1 ? 's' : ''} prescrits
													</p>
												</div>
											</div>

											<Badge variant="secondary" className={statusClassName}>
												{status === 'active' && 'Active'}
												{status === 'completed' && 'Terminée'}
												{status !== 'active' && status !== 'completed' && 'Expirée'}
											</Badge>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Progression</span>
												<span className="text-foreground font-medium">{Math.round(progress)}%</span>
											</div>

											<Progress value={progress} className="h-2" />
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="text-lg">Statistiques rendez-vous</CardTitle>
							<CardDescription>Répartition des statuts</CardDescription>
						</CardHeader>

						<CardContent className="space-y-4">
							{appointmentStats.map((stat) => (
								<div key={stat.label} className="flex items-center gap-3">
									<div className={`rounded-lg p-2 ${stat.color}/10`}>
										<stat.icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
									</div>

									<div className="flex-1">
										<div className="mb-1 flex justify-between text-sm">
											<span className="text-muted-foreground">{stat.label}</span>
											<span className="text-foreground font-medium">{stat.value}</span>
										</div>

										<Progress
											value={totalAppointments > 0 ? (stat.value / totalAppointments) * 100 : 0}
											className={`h-1.5 [&>div]:${stat.color}`}
										/>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<Card className="border-0 shadow-sm">
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-lg">Équipe soignante</CardTitle>
								<CardDescription>Professionnels actifs</CardDescription>
							</div>

							<Link href="/dashboard/professionals">
								<Button variant="ghost" size="sm" className="text-primary">
									Gérer <ArrowRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						</CardHeader>

						<CardContent className="space-y-3">
							{(() => {
								const proMap = new Map<number, Appointment>();

								for (const apt of appointments) {
									if (apt.HealthcareProfessional && !proMap.has(apt.HealthcareProfessionalId)) {
										proMap.set(apt.HealthcareProfessionalId, apt);
									}
								}

								return [...proMap.values()].map((apt) => {
									const proUser = apt.HealthcareProfessional?.User;
									const firstName = proUser?.FirstName ?? '';
									const lastName = proUser?.LastName ?? '';

									return (
										<div
											key={apt.HealthcareProfessionalId}
											className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
										>
											<Avatar className="h-9 w-9">
												<AvatarFallback className="bg-[hsl(var(--accent))]/10 text-xs text-[hsl(var(--accent))]">
													{firstName[0]}
													{lastName[0]}
												</AvatarFallback>
											</Avatar>

											<div className="min-w-0 flex-1">
												<p className="text-foreground truncate text-sm font-medium">
													{firstName} {lastName}
												</p>
												<p className="text-muted-foreground text-xs">{apt.HealthcareProfessional?.Speciality ?? ''}</p>
											</div>

											<Badge variant="secondary" className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]">
												Actif
											</Badge>
										</div>
									);
								});
							})()}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
