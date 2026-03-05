'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import { Activity, ArrowRight, Calendar, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentStatus, type Appointment } from '@/lib/types';

interface ProfessionalDashboardProps {
	appointments: Appointment[];
}

export function ProfessionalDashboard({ appointments }: ProfessionalDashboardProps) {
	const todayAppointments = appointments
		.filter(
			(appointment) =>
				new Date(appointment.AppointmentStartDate).toDateString() === new Date().toDateString() &&
				appointment.Status === AppointmentStatus.PLANNED,
		)
		.toSorted((a, b) => new Date(a.AppointmentStartDate).getTime() - new Date(b.AppointmentStartDate).getTime());

	const upcomingAppointments = appointments
		.filter(
			(appointment) =>
				appointment.Status === AppointmentStatus.PLANNED && new Date(appointment.AppointmentStartDate) > new Date(),
		)
		.toSorted((a, b) => new Date(a.AppointmentStartDate).getTime() - new Date(b.AppointmentStartDate).getTime());

	const completedToday = appointments.filter(
		(a) =>
			new Date(a.AppointmentStartDate).toDateString() === new Date().toDateString() &&
			a.Status === AppointmentStatus.PERFORMED,
	);

	const uniquePatients = useMemo(() => {
		const map = new Map<number, Appointment>();

		for (const apt of appointments) {
			if (apt.Patient && !map.has(apt.PatientId)) {
				map.set(apt.PatientId, apt);
			}
		}

		return [...map.values()];
	}, [appointments]);

	const stats = [
		{
			title: 'Patients suivis',
			value: uniquePatients.length,
			icon: Users,
			color: 'text-primary',
			bgColor: 'bg-primary/10',
			trend: '',
		},
		{
			title: "Rendez-vous aujourd'hui",
			value: todayAppointments.length,
			icon: Calendar,
			color: 'text-[hsl(var(--accent))]',
			bgColor: 'bg-[hsl(var(--accent))]/10',
			trend: `${String(completedToday.length)} terminé${completedToday.length > 1 ? 's' : ''}`,
		},
		{
			title: 'Actes validés',
			value: appointments.filter((a) => a.Status === AppointmentStatus.PERFORMED).length,
			icon: CheckCircle2,
			color: 'text-[hsl(var(--success))]',
			bgColor: 'bg-[hsl(var(--success))]/10',
			trend: 'Total',
		},
		{
			title: 'En attente',
			value: upcomingAppointments.length,
			icon: Clock,
			color: 'text-[hsl(var(--warning))]',
			bgColor: 'bg-[hsl(var(--warning))]/10',
			trend: 'À planifier',
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
							<CardTitle className="text-lg">Planning du jour</CardTitle>
							<CardDescription>
								{new Date().toLocaleDateString('fr-FR', {
									weekday: 'long',
									day: 'numeric',
									month: 'long',
								})}
							</CardDescription>
						</div>

						<Link href="/dashboard/appointments">
							<Button variant="ghost" size="sm" className="text-primary">
								Voir le planning <ArrowRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>

					<CardContent>
						{todayAppointments.length === 0 ? (
							<div className="text-muted-foreground py-8 text-center">
								<Calendar className="mx-auto mb-2 h-10 w-10 opacity-50" />
								<p>Aucun rendez-vous prévu aujourd'hui</p>
							</div>
						) : (
							<div className="space-y-3">
								{todayAppointments.map((apt, index) => {
									const patientName = apt.Patient?.User
										? `${apt.Patient.User.FirstName} ${apt.Patient.User.LastName}`
										: 'Patient';
									const actName = apt.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';
									return (
										<div
											key={apt.Id}
											className="border-border bg-card flex items-center gap-4 rounded-lg border p-4 transition-shadow hover:shadow-sm"
										>
											<div className="min-w-15 text-center">
												<p className="text-primary text-lg font-bold">
													{new Date(apt.AppointmentStartDate).toLocaleTimeString('fr-FR', {
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>

											<div className="bg-border h-12 w-px" />

											<Avatar className="h-10 w-10">
												<AvatarFallback className="bg-primary/10 text-primary text-sm">
													{patientName
														.split(' ')
														.map((n) => n[0])
														.join('')}
												</AvatarFallback>
											</Avatar>

											<div className="min-w-0 flex-1">
												<p className="text-foreground font-medium">{patientName}</p>
												<p className="text-muted-foreground text-sm">{actName}</p>
											</div>

											<Badge
												variant="secondary"
												className={
													index === 0
														? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'
														: 'bg-muted text-muted-foreground'
												}
											>
												{index === 0 ? 'Prochain' : 'Prévu'}
											</Badge>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-lg">Mes patients</CardTitle>
							<CardDescription>Patients en cours de suivi</CardDescription>
						</div>

						<Link href="/dashboard/patients">
							<Button variant="ghost" size="sm" className="text-primary">
								Voir tout <ArrowRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>

					<CardContent className="space-y-3">
						{uniquePatients.slice(0, 4).map((apt) => {
							const patientUser = apt.Patient?.User;
							const firstName = patientUser?.FirstName ?? '';
							const lastName = patientUser?.LastName ?? '';

							return (
								<div
									key={apt.PatientId}
									className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-3 transition-colors"
								>
									<Avatar className="h-9 w-9">
										<AvatarFallback className="bg-primary/10 text-primary text-xs">
											{firstName[0]}
											{lastName[0]}
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<p className="text-foreground truncate text-sm font-medium">
											{firstName} {lastName}
										</p>
									</div>

									<Activity className="h-4 w-4 text-[hsl(var(--success))]" />
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
