'use client';

import { CheckCircle2, Clock, Stethoscope, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Appointment, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PendingValidationsProps {
	appointments: Appointment[];
	userRole: UserRole;
	onSelect: (id: string) => void;
	selectedId: string | null;
}

function getAptDisplayName(appointment: Appointment, forRole: 'other' | 'patient') {
	if (forRole === 'patient') {
		return appointment.HealthcareProfessional?.User
			? `${appointment.HealthcareProfessional.User.FirstName} ${appointment.HealthcareProfessional.User.LastName}`
			: 'Professionnel';
	}

	return appointment.Patient?.User
		? `${appointment.Patient.User.FirstName} ${appointment.Patient.User.LastName}`
		: 'Patient';
}

export function PendingValidations({ appointments, userRole, onSelect, selectedId }: PendingValidationsProps) {
	const now = new Date();

	const sortedAppointments = appointments.toSorted(
		(a, b) => new Date(a.AppointmentStartDate).getTime() - new Date(b.AppointmentStartDate).getTime(),
	);

	const nextAppointment = sortedAppointments.find((appointment) => new Date(appointment.AppointmentStartDate) >= now);

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
					Soins à valider aujourd'hui
				</CardTitle>
				<CardDescription>{appointments.length} rendez-vous en attente de validation</CardDescription>
			</CardHeader>

			<CardContent>
				{appointments.length === 0 ? (
					<div className="py-8 text-center">
						<CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-[hsl(var(--success))]/30" />
						<p className="text-muted-foreground text-sm">Tous les soins du jour ont été validés</p>
					</div>
				) : (
					<div className="space-y-3">
						{sortedAppointments.map((appointment) => {
							const appointmentTime = new Date(appointment.AppointmentStartDate);
							const isPast = appointmentTime < now;
							const appointmentId = String(appointment.Id);
							const isNext = appointmentId === (nextAppointment ? String(nextAppointment.Id) : null);
							const isSelected = appointmentId === selectedId;
							const actName = appointment.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';
							const displayName = getAptDisplayName(appointment, userRole === 'patient' ? 'patient' : 'other');
							const initials = displayName
								.split(' ')
								.map((names) => names[0])
								.join('');

							return (
								<button
									key={appointmentId}
									type="button"
									onClick={() => onSelect(appointmentId)}
									className={cn(
										'flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all duration-200',
										isSelected
											? 'border-primary bg-primary/5 shadow-sm'
											: 'border-border bg-card hover:border-primary/50 hover:bg-muted/30',
										isPast && !isSelected && 'opacity-60',
									)}
								>
									<div
										className={cn(
											'min-w-12.5 rounded-lg p-2 text-center',
											isNext ? 'bg-[hsl(var(--warning))]/10' : 'bg-muted/50',
										)}
									>
										<p className={cn('text-lg font-bold', isNext ? 'text-[hsl(var(--warning))]' : 'text-foreground')}>
											{appointmentTime.toLocaleTimeString('fr-FR', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</div>

									<Avatar className="h-10 w-10 shrink-0">
										<AvatarFallback
											className={cn(
												'text-sm',
												userRole === 'patient'
													? 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]'
													: 'bg-primary/10 text-primary',
											)}
										>
											{initials}
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<p className="text-foreground truncate font-medium">{actName}</p>
										<div className="text-muted-foreground flex items-center gap-1 text-xs">
											{userRole === 'patient' ? (
												<>
													<Stethoscope className="h-3 w-3" />
													<span className="truncate">{displayName}</span>
												</>
											) : (
												<>
													<User className="h-3 w-3" />
													<span className="truncate">{displayName}</span>
												</>
											)}
										</div>
									</div>

									<div className="flex flex-col items-end gap-1">
										{isNext && (
											<Badge
												variant="secondary"
												className="bg-[hsl(var(--warning))]/10 text-xs text-[hsl(var(--warning))]"
											>
												Prochain
											</Badge>
										)}

										{isPast && !isNext && (
											<Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
												Passé
											</Badge>
										)}

										<Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
											En attente
										</Badge>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{appointments.length > 0 && (
					<div className="border-border mt-4 border-t pt-4">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Total à valider</span>
							<span className="text-foreground font-semibold">
								{appointments.length} acte{appointments.length > 1 ? 's' : ''}
							</span>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
