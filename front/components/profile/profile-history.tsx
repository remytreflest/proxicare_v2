'use client';

import { Calendar, CheckCircle2, Clock, FileText, History, XCircle } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentStatus, type Appointment, type Prescription, type UserRole } from '@/lib/types';
import { getPrescriptionStatus } from '@/lib/utils';

interface ProfileHistoryProps {
	userRole: UserRole;
	initialAppointments: Appointment[];
	initialPrescriptions: Prescription[];
}

function computeProgress(prescription: Prescription): number {
	if (!prescription.PrescriptionHealthcareActs || prescription.PrescriptionHealthcareActs.length === 0) {
		return 0;
	}

	const start = new Date(prescription.StartDate);
	const end = new Date(prescription.EndDate);
	const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	const totalOccurrences = prescription.PrescriptionHealthcareActs.reduce(
		(accumulator, act) => accumulator + act.OccurrencesPerDay * totalDays,
		0,
	);
	const completedOccurrences = prescription.PrescriptionHealthcareActs.reduce(
		(accumulator, act) =>
			accumulator +
			(act.Appointments?.filter((appointment) => appointment.Status === AppointmentStatus.PERFORMED).length ?? 0),
		0,
	);

	return totalOccurrences > 0 ? Math.round((completedOccurrences / totalOccurrences) * 100) : 0;
}

export function ProfileHistory({ userRole, initialAppointments, initialPrescriptions }: ProfileHistoryProps) {
	const appointments = initialAppointments;
	const prescriptions = initialPrescriptions;

	const validatedAppointments = appointments.filter(
		(appointment) => appointment.Status === AppointmentStatus.PERFORMED,
	);
	const cancelledAppointments = appointments.filter(
		(appointment) => appointment.Status === AppointmentStatus.CANCELLED,
	);
	const completedPrescriptions = prescriptions.filter(
		(prescription) => getPrescriptionStatus(prescription) === 'completed',
	);

	const stats = [
		{
			label: 'Actes validés',
			value: validatedAppointments.length,
			icon: CheckCircle2,
			color: 'text-[hsl(var(--success))]',
			bgColor: 'bg-[hsl(var(--success))]/10',
		},
		{
			label: 'Annulations',
			value: cancelledAppointments.length,
			icon: XCircle,
			color: 'text-destructive',
			bgColor: 'bg-destructive/10',
		},
		{
			label: 'Prescriptions terminées',
			value: completedPrescriptions.length,
			icon: FileText,
			color: 'text-primary',
			bgColor: 'bg-primary/10',
		},
	];

	if (appointments.length === 0 && prescriptions.length === 0) {
		return <div className="text-muted-foreground py-12 text-center">Aucun historique disponible</div>;
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{stats.map((stat) => (
					<Card key={stat.label} className="border-0 shadow-sm">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<div className={`rounded-lg p-2 ${stat.bgColor}`}>
									<stat.icon className={`h-5 w-5 ${stat.color}`} />
								</div>

								<div>
									<p className="text-foreground text-2xl font-bold">{stat.value}</p>
									<p className="text-muted-foreground text-xs">{stat.label}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<History className="text-primary h-5 w-5" />
						Historique des activités
					</CardTitle>
					<CardDescription>Consultez l'historique de vos soins et prescriptions</CardDescription>
				</CardHeader>

				<CardContent>
					<Tabs defaultValue="appointments" className="flex flex-col">
						<TabsList className="mb-4">
							<TabsTrigger value="appointments" className="gap-1">
								<Calendar className="h-4 w-4" />
								Rendez-vous
							</TabsTrigger>

							<TabsTrigger value="prescriptions" className="gap-1">
								<FileText className="h-4 w-4" />
								Prescriptions
							</TabsTrigger>
						</TabsList>

						<TabsContent value="appointments" className="space-y-3">
							{appointments.length === 0 ? (
								<p className="text-muted-foreground py-8 text-center">Aucun rendez-vous dans l'historique</p>
							) : (
								appointments.slice(0, 10).map((apt) => {
									const actName = apt.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';
									const proName = apt.HealthcareProfessional?.User
										? `${apt.HealthcareProfessional.User.FirstName} ${apt.HealthcareProfessional.User.LastName}`
										: '';
									const patName = apt.Patient?.User ? `${apt.Patient.User.FirstName} ${apt.Patient.User.LastName}` : '';
									const displayName = userRole === 'patient' ? proName : patName;

									let statusBgClass = 'bg-primary/10';
									let statusBadgeClass = 'bg-primary/10 text-primary';
									let statusLabel = 'Prévu';
									let StatusIcon = Clock;
									let statusIconColor = 'text-primary';

									if (apt.Status === AppointmentStatus.PERFORMED) {
										statusBgClass = 'bg-[hsl(var(--success))]/10';
										statusBadgeClass = 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
										statusLabel = 'Validé';
										StatusIcon = CheckCircle2;
										statusIconColor = 'text-[hsl(var(--success))]';
									} else if (apt.Status === AppointmentStatus.CANCELLED) {
										statusBgClass = 'bg-destructive/10';
										statusBadgeClass = 'bg-destructive/10 text-destructive';
										statusLabel = 'Annulé';
										StatusIcon = XCircle;
										statusIconColor = 'text-destructive';
									}

									return (
										<div
											key={String(apt.Id)}
											className="border-border bg-card flex items-center gap-4 rounded-lg border p-3"
										>
											<div className={`rounded-lg p-2 ${statusBgClass}`}>
												<StatusIcon className={`h-4 w-4 ${statusIconColor}`} />
											</div>

											<div className="min-w-0 flex-1">
												<p className="text-foreground truncate text-sm font-medium">{actName}</p>
												<p className="text-muted-foreground text-xs">{displayName}</p>
											</div>

											<div className="text-right">
												<p className="text-foreground text-sm">
													{new Date(apt.AppointmentStartDate).toLocaleDateString('fr-FR')}
												</p>

												<Badge variant="secondary" className={`text-xs ${statusBadgeClass}`}>
													{statusLabel}
												</Badge>
											</div>
										</div>
									);
								})
							)}
						</TabsContent>

						<TabsContent value="prescriptions" className="space-y-3">
							{prescriptions.length === 0 ? (
								<p className="text-muted-foreground py-8 text-center">Aucune prescription dans l'historique</p>
							) : (
								prescriptions.map((prescription) => {
									const progress = computeProgress(prescription);
									const status = getPrescriptionStatus(prescription);
									const actCount = prescription.PrescriptionHealthcareActs?.length ?? 0;
									const patName = prescription.Patient?.User
										? `${prescription.Patient.User.FirstName} ${prescription.Patient.User.LastName}`
										: prescription.SocialSecurityNumber;
									const initials = prescription.Patient?.User
										? `${prescription.Patient.User.FirstName[0]}${prescription.Patient.User.LastName[0]}`
										: '?';

									let prescBadgeClass = 'bg-destructive/10 text-destructive';
									let prescLabel = 'Expirée';

									if (status === 'active') {
										prescBadgeClass = 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
										prescLabel = 'Active';
									} else if (status === 'completed') {
										prescBadgeClass = 'bg-muted text-muted-foreground';
										prescLabel = 'Terminée';
									}

									return (
										<div
											key={String(prescription.Id)}
											className="border-border bg-card flex items-center gap-4 rounded-lg border p-3"
										>
											<Avatar className="h-10 w-10">
												<AvatarFallback className="bg-primary/10 text-primary text-sm">{initials}</AvatarFallback>
											</Avatar>

											<div className="min-w-0 flex-1">
												<p className="text-foreground truncate text-sm font-medium">{patName}</p>
												<p className="text-muted-foreground text-xs">
													{actCount} acte{actCount > 1 ? 's' : ''} - {progress}% complété
												</p>
											</div>

											<div className="text-right">
												<p className="text-foreground text-sm">
													{new Date(prescription.StartDate).toLocaleDateString('fr-FR')}
												</p>

												<Badge variant="secondary" className={`text-xs ${prescBadgeClass}`}>
													{prescLabel}
												</Badge>
											</div>
										</div>
									);
								})
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
