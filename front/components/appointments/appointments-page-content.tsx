'use client';

import { useState } from 'react';

import { CalendarDays, List, Plus } from 'lucide-react';

import { AppointmentCalendar } from '@/components/appointments/appointment-calendar';
import { AppointmentDetails } from '@/components/appointments/appointment-details';
import { AppointmentList } from '@/components/appointments/appointment-list';
import { PlanAppointmentDialog } from '@/components/appointments/plan-appointment-dialog';
import { Button } from '@/components/ui/button';
import { deleteAppointment, fetchAppointments } from '@/lib/api';
import type { Appointment, User, UserRole } from '@/lib/types';

interface AppointmentsPageContentProps {
	initialAppointments: Appointment[];
	user: User | null;
	role: UserRole | null;
}

export function AppointmentsPageContent({ initialAppointments, user, role }: AppointmentsPageContentProps) {
	const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [view, setView] = useState<'calendar' | 'list'>('calendar');
	const [isPlanOpen, setIsPlanOpen] = useState(false);

	if (!user || !role) {
		return null;
	}

	const sorted = [...appointments].toSorted(
		(a, b) => new Date(a.AppointmentStartDate).getTime() - new Date(b.AppointmentStartDate).getTime(),
	);

	const handleAppointmentUpdate = async (appointmentId: string, status: 'cancelled' | 'validated') => {
		if (status === 'cancelled') {
			await deleteAppointment(Number(appointmentId));

			setAppointments((previous) => previous.filter((a) => a.Id !== Number(appointmentId)));
		}

		setSelectedAppointment(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-muted-foreground">
						{role === 'patient' && 'Consultez et gérez vos rendez-vous médicaux'}
						{role === 'professional' && 'Gérez votre planning de soins'}
						{role !== 'patient' && role !== 'professional' && 'Vue globale des rendez-vous'}
					</p>
				</div>

				<div className="flex items-center gap-2">
					<div className="border-border flex items-center rounded-lg border p-1">
						<Button
							variant={view === 'calendar' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setView('calendar')}
							className={view === 'calendar' ? '' : 'bg-transparent'}
						>
							<CalendarDays className="mr-1 h-4 w-4" />
							Calendrier
						</Button>

						<Button
							variant={view === 'list' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setView('list')}
							className={view === 'list' ? '' : 'bg-transparent'}
						>
							<List className="mr-1 h-4 w-4" />
							Liste
						</Button>
					</div>

					{role === 'professional' && (
						<Button className="gap-2" onClick={() => setIsPlanOpen(true)}>
							<Plus className="h-4 w-4" />
							Planifier
						</Button>
					)}
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					{view === 'calendar' ? (
						<AppointmentCalendar
							appointments={sorted}
							selectedDate={selectedDate}
							onDateSelect={setSelectedDate}
							onAppointmentSelect={setSelectedAppointment}
						/>
					) : (
						<AppointmentList
							appointments={sorted}
							selectedId={selectedAppointment?.Id.toString()}
							onSelect={setSelectedAppointment}
							userRole={role}
						/>
					)}
				</div>

				<div className="lg:col-span-1">
					<AppointmentDetails
						appointment={selectedAppointment}
						userRole={role}
						onUpdate={handleAppointmentUpdate}
						onClose={() => setSelectedAppointment(null)}
					/>
				</div>
			</div>

			<PlanAppointmentDialog
				open={isPlanOpen}
				onOpenChange={setIsPlanOpen}
				onCreated={async () => {
					setAppointments(await fetchAppointments());
				}}
			/>
		</div>
	);
}
