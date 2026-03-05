'use client';

import { Calendar, ChevronRight, Stethoscope, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AppointmentStatus, type Appointment, type UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppointmentListProps {
	appointments: Appointment[];
	selectedId?: string;
	onSelect: (appointment: Appointment) => void;
	userRole: UserRole;
}

const statusConfig: Record<string, { label: string; className: string }> = {
	PLANNED: { label: 'Prévu', className: 'bg-primary/10 text-primary' },
	PERFORMED: { label: 'Validé', className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' },
	CANCELLED: { label: 'Annulé', className: 'bg-destructive/10 text-destructive' },
};

export function AppointmentList({ appointments, selectedId, onSelect, userRole }: AppointmentListProps) {
	const groupedAppointments: Record<string, Appointment[]> = {};

	for (const apt of appointments) {
		const dateKey = new Date(apt.AppointmentStartDate).toDateString();

		if (!(dateKey in groupedAppointments)) {
			groupedAppointments[dateKey] = [];
		}

		groupedAppointments[dateKey].push(apt);
	}

	const sortedDates = Object.keys(groupedAppointments).toSorted(
		(a, b) => new Date(a).getTime() - new Date(b).getTime(),
	);

	if (appointments.length === 0) {
		return (
			<Card className="border-0 shadow-sm">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<Calendar className="text-muted-foreground/50 mb-4 h-12 w-12" />
					<h3 className="text-foreground mb-1 text-lg font-medium">Aucun rendez-vous</h3>
					<p className="text-muted-foreground text-center text-sm">Vous n'avez pas encore de rendez-vous planifiés.</p>
				</CardContent>
			</Card>
		);
	}

	const isToday = (dateString: string) => {
		return new Date(dateString).toDateString() === new Date().toDateString();
	};

	const isPast = (dateString: string) => {
		return new Date(dateString) < new Date(new Date().toDateString());
	};

	return (
		<div className="space-y-6">
			{sortedDates.map((dateKey) => {
				const dayAppointments = groupedAppointments[dateKey];
				const date = new Date(dateKey);

				return (
					<div key={dateKey}>
						<div className="mb-3 flex items-center gap-2">
							<h3 className={cn('text-sm font-medium', isToday(dateKey) ? 'text-primary' : 'text-foreground')}>
								{isToday(dateKey)
									? "Aujourd'hui"
									: date.toLocaleDateString('fr-FR', {
											weekday: 'long',
											day: 'numeric',
											month: 'long',
										})}
							</h3>

							{isToday(dateKey) && (
								<Badge variant="secondary" className="bg-primary/10 text-primary">
									{dayAppointments.filter((a) => a.Status === AppointmentStatus.PLANNED).length} à venir
								</Badge>
							)}

							{isPast(dateKey) && !isToday(dateKey) && (
								<Badge variant="secondary" className="bg-muted text-muted-foreground">
									Passé
								</Badge>
							)}
						</div>

						<div className="space-y-2">
							{dayAppointments.map((apt) => {
								const status = statusConfig[apt.Status] ?? statusConfig.PLANNED;
								const isSelected = selectedId === String(apt.Id);
								const showPatient = userRole !== 'patient';
								const showProfessional = userRole === 'patient' || userRole === 'structure' || userRole === 'admin';
								const patientName = apt.Patient?.User
									? `${apt.Patient.User.FirstName} ${apt.Patient.User.LastName}`
									: '';
								const professionalName = apt.HealthcareProfessional?.User
									? `${apt.HealthcareProfessional.User.FirstName} ${apt.HealthcareProfessional.User.LastName}`
									: '';
								const actName = apt.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';
								const displayName = showPatient ? patientName : professionalName;

								return (
									<Card
										key={apt.Id}
										className={cn(
											'cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md',
											isSelected && 'ring-primary shadow-md ring-2',
										)}
										onClick={() => onSelect(apt)}
									>
										<CardContent className="p-4">
											<div className="flex items-center gap-4">
												{/* Time */}
												<div className="min-w-15 text-center">
													<p className="text-primary text-lg font-bold">
														{new Date(apt.AppointmentStartDate).toLocaleTimeString('fr-FR', {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</p>
												</div>

												<div className="bg-border h-12 w-px" />

												<Avatar className="h-10 w-10 shrink-0">
													<AvatarFallback className="bg-primary/10 text-primary text-sm">
														{displayName
															.split(' ')
															.map((n) => n[0])
															.join('')}
													</AvatarFallback>
												</Avatar>

												<div className="min-w-0 flex-1">
													<p className="text-foreground truncate font-medium">{actName}</p>

													<div className="text-muted-foreground flex items-center gap-3 text-xs">
														{showPatient && patientName && (
															<span className="flex items-center gap-1">
																<User className="h-3 w-3" />
																{patientName}
															</span>
														)}

														{showProfessional && professionalName && (
															<span className="flex items-center gap-1">
																<Stethoscope className="h-3 w-3" />
																{professionalName}
															</span>
														)}
													</div>
												</div>

												<Badge variant="secondary" className={status.className}>
													{status.label}
												</Badge>

												<ChevronRight
													className={cn('text-muted-foreground h-4 w-4 shrink-0', isSelected && 'text-primary')}
												/>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
