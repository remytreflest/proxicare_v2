'use client';

import Link from 'next/link';

import { Calendar, CheckCircle2, Clock, FileText, QrCode, Stethoscope, X, XCircle } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AppointmentStatus, type Appointment, type UserRole } from '@/lib/types';

interface AppointmentDetailsProps {
	appointment: Appointment | null;
	userRole: UserRole;
	onUpdate: (appointmentId: string, status: 'cancelled' | 'validated') => void;
	onClose: () => void;
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
	PLANNED: { label: 'Prévu', icon: Clock, className: 'bg-primary/10 text-primary' },
	PERFORMED: {
		label: 'Validé',
		icon: CheckCircle2,
		className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
	},
	CANCELLED: { label: 'Annulé', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
};

export function AppointmentDetails({ appointment, userRole, onUpdate, onClose }: AppointmentDetailsProps) {
	if (!appointment) {
		return (
			<Card className="sticky top-24 border-0 shadow-sm">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<Calendar className="text-muted-foreground/50 mb-4 h-12 w-12" />
					<h3 className="text-foreground mb-1 text-lg font-medium">Sélectionnez un rendez-vous</h3>
					<p className="text-muted-foreground text-center text-sm">Cliquez sur un rendez-vous pour voir ses détails</p>
				</CardContent>
			</Card>
		);
	}

	const status = statusConfig[appointment.Status] ?? statusConfig.PLANNED;
	const StatusIcon = status.icon;
	const isScheduled = appointment.Status === AppointmentStatus.PLANNED;
	const appointmentDate = new Date(appointment.AppointmentStartDate);
	const isToday = appointmentDate.toDateString() === new Date().toDateString();
	const patientName = appointment.Patient?.User
		? `${appointment.Patient.User.FirstName} ${appointment.Patient.User.LastName}`
		: '';
	const professionalName = appointment.HealthcareProfessional?.User
		? `${appointment.HealthcareProfessional.User.FirstName} ${appointment.HealthcareProfessional.User.LastName}`
		: '';
	const actName = appointment.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';

	return (
		<Card className="sticky top-24 border-0 shadow-sm">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<CardTitle className="text-lg">Détails du rendez-vous</CardTitle>

					<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<Badge variant="secondary" className={`${status.className} gap-1`}>
						<StatusIcon className="h-3 w-3" />
						{status.label}
					</Badge>

					{isToday && isScheduled && (
						<Badge variant="secondary" className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]">
							Aujourd'hui
						</Badge>
					)}
				</div>

				<Separator />

				<div className="bg-primary/5 border-primary/10 rounded-lg border p-4">
					<h4 className="text-foreground mb-1 font-semibold">{actName}</h4>
					<p className="text-muted-foreground text-sm">Acte de soin médical</p>
				</div>

				<div className="flex items-center gap-3">
					<div className="bg-primary/10 rounded-lg p-2">
						<Calendar className="text-primary h-4 w-4" />
					</div>

					<div>
						<p className="text-muted-foreground text-xs">Date et heure</p>
						<p className="text-foreground text-sm font-medium">
							{appointmentDate.toLocaleDateString('fr-FR', {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</p>
						<p className="text-primary text-sm font-semibold">
							{appointmentDate.toLocaleTimeString('fr-FR', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
				</div>

				<Separator />

				{userRole !== 'patient' && patientName && (
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarFallback className="bg-primary/10 text-primary text-sm">
								{patientName
									.split(' ')
									.map((n) => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>

						<div>
							<p className="text-muted-foreground text-xs">Patient</p>
							<p className="text-foreground text-sm font-medium">{patientName}</p>
						</div>
					</div>
				)}

				{(userRole === 'patient' || userRole === 'structure' || userRole === 'admin') && (
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-[hsl(var(--accent))]/10 p-2">
							<Stethoscope className="h-4 w-4 text-[hsl(var(--accent))]" />
						</div>

						<div>
							<p className="text-muted-foreground text-xs">Professionnel</p>
							<p className="text-foreground text-sm font-medium">{professionalName}</p>
						</div>
					</div>
				)}

				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-[hsl(var(--warning))]/10 p-2">
						<FileText className="h-4 w-4 text-[hsl(var(--warning))]" />
					</div>

					<div className="flex-1">
						<p className="text-muted-foreground text-xs">Prescription</p>
						<Link href="/dashboard/prescriptions" className="text-primary text-sm font-medium hover:underline">
							Voir la prescription associée
						</Link>
					</div>
				</div>

				{appointment.Status === AppointmentStatus.PERFORMED && (
					<>
						<Separator />
						<div className="rounded-lg border border-[hsl(var(--success))]/20 bg-[hsl(var(--success))]/10 p-3">
							<div className="mb-1 flex items-center gap-2">
								<CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
								<span className="text-sm font-medium text-[hsl(var(--success))]">Acte validé</span>
							</div>
						</div>
					</>
				)}

				{isScheduled && (
					<>
						<Separator />
						<div className="space-y-2">
							{userRole === 'patient' && isToday && (
								<Link href="/dashboard/qr-validation" className="block">
									<Button className="w-full gap-2">
										<QrCode className="h-4 w-4" />
										Valider avec QR Code
									</Button>
								</Link>
							)}

							{userRole === 'professional' && (
								<>
									<Button className="w-full gap-2" onClick={() => onUpdate(String(appointment.Id), 'validated')}>
										<CheckCircle2 className="h-4 w-4" />
										Valider l&apos;acte
									</Button>
									<Button
										variant="outline"
										className="text-destructive hover:bg-destructive/10 w-full gap-2 bg-transparent"
										onClick={() => onUpdate(String(appointment.Id), 'cancelled')}
									>
										<XCircle className="h-4 w-4" />
										Annuler le rendez-vous
									</Button>
								</>
							)}

							{(userRole === 'structure' || userRole === 'admin') && (
								<Button
									variant="outline"
									className="text-destructive hover:bg-destructive/10 w-full gap-2 bg-transparent"
									onClick={() => onUpdate(String(appointment.Id), 'cancelled')}
								>
									<XCircle className="h-4 w-4" />
									Annuler le rendez-vous
								</Button>
							)}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
