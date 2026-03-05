'use client';

import Link from 'next/link';

import { Activity, ArrowRight, Calendar, CheckCircle2, Clock, FileText, QrCode } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentStatus, type Appointment, type Prescription } from '@/lib/types';
import { getPrescriptionStatus } from '@/lib/utils';

interface PatientDashboardProps {
	appointments: Appointment[];
	prescriptions: Prescription[];
}

export function PatientDashboard({ appointments, prescriptions }: PatientDashboardProps) {
	const activePrescriptions = prescriptions.filter((prescription) => getPrescriptionStatus(prescription) === 'active');
	const upcomingAppointments = appointments
		.filter(
			(appointment) =>
				appointment.Status === AppointmentStatus.PLANNED && new Date(appointment.AppointmentStartDate) >= new Date(),
		)
		.toSorted((a, b) => new Date(a.AppointmentStartDate).getTime() - new Date(b.AppointmentStartDate).getTime());
	const completedAppointments = appointments.filter(
		(appointment) => appointment.Status === AppointmentStatus.PERFORMED,
	);

	const stats = [
		{
			title: 'Prescriptions actives',
			value: activePrescriptions.length,
			icon: FileText,
			color: 'text-primary',
			bgColor: 'bg-primary/10',
		},
		{
			title: 'Rendez-vous à venir',
			value: upcomingAppointments.length,
			icon: Calendar,
			color: 'text-[hsl(var(--accent))]',
			bgColor: 'bg-[hsl(var(--accent))]/10',
		},
		{
			title: 'Soins validés',
			value: completedAppointments.length,
			icon: CheckCircle2,
			color: 'text-[hsl(var(--success))]',
			bgColor: 'bg-[hsl(var(--success))]/10',
		},
		{
			title: 'En attente',
			value: upcomingAppointments.filter(
				(appointment) => new Date(appointment.AppointmentStartDate).toDateString() === new Date().toDateString(),
			).length,
			icon: Clock,
			color: 'text-[hsl(var(--warning))]',
			bgColor: 'bg-[hsl(var(--warning))]/10',
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.title} className="border-0 shadow-sm">
						<CardContent className="p-5">
							<div className="flex items-center gap-4">
								<div className={`rounded-xl p-3 ${stat.bgColor}`}>
									<stat.icon className={`h-5 w-5 ${stat.color}`} />
								</div>

								<div>
									<p className="text-foreground text-2xl font-bold">{stat.value}</p>
									<p className="text-muted-foreground text-sm">{stat.title}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="border-0 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-lg">Prochains rendez-vous</CardTitle>
							<CardDescription>Vos rendez-vous à venir</CardDescription>
						</div>

						<Link href="/dashboard/appointments">
							<Button variant="ghost" size="sm" className="text-primary">
								Voir tout <ArrowRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>

					<CardContent className="space-y-3">
						{upcomingAppointments.length === 0 ? (
							<div className="text-muted-foreground py-8 text-center">
								<Calendar className="mx-auto mb-2 h-10 w-10 opacity-50" />
								<p>Aucun rendez-vous à venir</p>
							</div>
						) : (
							upcomingAppointments.slice(0, 4).map((apt) => (
								<div
									key={apt.Id}
									className="bg-muted/50 hover:bg-muted flex items-center gap-4 rounded-lg p-3 transition-colors"
								>
									<div className="bg-primary/10 rounded-lg p-2">
										<Activity className="text-primary h-4 w-4" />
									</div>

									<div className="min-w-0 flex-1">
										<p className="text-foreground truncate text-sm font-medium">
											{apt.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte'}
										</p>
										<p className="text-muted-foreground text-xs">
											{apt.HealthcareProfessional?.User
												? `${apt.HealthcareProfessional.User.FirstName} ${apt.HealthcareProfessional.User.LastName}`
												: ''}
										</p>
									</div>

									<div className="text-right">
										<p className="text-foreground text-sm font-medium">
											{new Date(apt.AppointmentStartDate).toLocaleDateString('fr-FR', {
												day: 'numeric',
												month: 'short',
											})}
										</p>
										<p className="text-muted-foreground text-xs">
											{new Date(apt.AppointmentStartDate).toLocaleTimeString('fr-FR', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>

				<Card className="border-0 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="text-lg">Prescriptions actives</CardTitle>
							<CardDescription>Vos traitements en cours</CardDescription>
						</div>

						<Link href="/dashboard/prescriptions">
							<Button variant="ghost" size="sm" className="text-primary">
								Voir tout <ArrowRight className="ml-1 h-4 w-4" />
							</Button>
						</Link>
					</CardHeader>

					<CardContent className="space-y-3">
						{activePrescriptions.length === 0 ? (
							<div className="text-muted-foreground py-8 text-center">
								<FileText className="mx-auto mb-2 h-10 w-10 opacity-50" />
								<p>Aucune prescription active</p>
							</div>
						) : (
							activePrescriptions.map((presc) => (
								<div key={presc.Id} className="border-border bg-card rounded-lg border p-4">
									<div className="mb-3 flex items-start justify-between">
										<div>
											<p className="text-foreground font-medium">Prescription #{presc.Id}</p>
											<p className="text-muted-foreground text-xs">
												Valide jusqu&apos;au {new Date(presc.EndDate).toLocaleDateString('fr-FR')}
											</p>
										</div>

										<Badge variant="secondary" className="bg-primary/10 text-primary">
											{presc.PrescriptionHealthcareActs?.length ?? 0} acte
											{(presc.PrescriptionHealthcareActs?.length ?? 0) > 1 ? 's' : ''}
										</Badge>
									</div>

									<div className="space-y-2">
										{presc.PrescriptionHealthcareActs?.map((act) => (
											<div key={act.Id} className="flex items-center justify-between text-sm">
												<span className="text-muted-foreground">{act.HealthcareAct?.Name ?? 'Acte'}</span>
												<span className="text-foreground font-medium">
													{act.Appointments?.filter((a) => a.Status === AppointmentStatus.PERFORMED).length ?? 0}/
													{act.OccurrencesPerDay}
												</span>
											</div>
										))}
									</div>
								</div>
							))
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-lg">Actions rapides</CardTitle>
					<CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="grid gap-4 sm:grid-cols-3">
						<Link href="/dashboard/qr-validation">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-6">
								<QrCode className="text-primary h-6 w-6" />
								<span>Valider un soin</span>
							</Button>
						</Link>

						<Link href="/dashboard/appointments">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-6">
								<Calendar className="text-primary h-6 w-6" />
								<span>Voir mes rendez-vous</span>
							</Button>
						</Link>

						<Link href="/dashboard/prescriptions">
							<Button variant="outline" className="h-auto w-full flex-col gap-2 bg-transparent py-6">
								<FileText className="text-primary h-6 w-6" />
								<span>Mes prescriptions</span>
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
