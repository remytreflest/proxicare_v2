'use client';

import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AppointmentStatus, type Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AppointmentCalendarProps {
	appointments: Appointment[];
	selectedDate: Date;
	onDateSelect: (date: Date) => void;
	onAppointmentSelect: (appointment: Appointment) => void;
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
	'Janvier',
	'Février',
	'Mars',
	'Avril',
	'Mai',
	'Juin',
	'Juillet',
	'Août',
	'Septembre',
	'Octobre',
	'Novembre',
	'Décembre',
];

export function AppointmentCalendar({
	appointments,
	selectedDate,
	onDateSelect,
	onAppointmentSelect,
}: AppointmentCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(new Date());

	const calendarDays = useMemo(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();

		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		const days: (Date | null)[] = [];

		let startDay = firstDay.getDay() - 1;

		if (startDay < 0) {
			startDay = 6;
		}

		for (let index = 0; index < startDay; index++) {
			days.push(null);
		}

		for (let index = 1; index <= lastDay.getDate(); index++) {
			days.push(new Date(year, month, index));
		}

		return days;
	}, [currentMonth]);

	const appointmentsByDate = useMemo(() => {
		const map = new Map<string, Appointment[]>();

		for (const apt of appointments) {
			const dateKey = new Date(apt.AppointmentStartDate).toDateString();

			if (!map.has(dateKey)) {
				map.set(dateKey, []);
			}

			map.get(dateKey)?.push(apt);
		}

		return map;
	}, [appointments]);

	const selectedDateAppointments = useMemo(
		() => appointmentsByDate.get(selectedDate.toDateString()) ?? [],
		[appointmentsByDate, selectedDate],
	);

	const goToPreviousMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
	};

	const goToNextMonth = () => {
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
	};

	const goToToday = () => {
		const today = new Date();

		setCurrentMonth(new Date(today.getFullYear(), today.getMonth()));
		onDateSelect(today);
	};

	const isToday = (date: Date) => {
		const today = new Date();

		return date.toDateString() === today.toDateString();
	};

	const isSelected = (date: Date) => {
		return date.toDateString() === selectedDate.toDateString();
	};

	const getStatusColor = (status: Appointment['Status']) => {
		switch (status) {
			case AppointmentStatus.PLANNED: {
				return 'bg-primary';
			}

			case AppointmentStatus.PERFORMED: {
				return 'bg-[hsl(var(--success))]';
			}

			case AppointmentStatus.CANCELLED: {
				return 'bg-destructive';
			}

			default: {
				return 'bg-muted';
			}
		}
	};

	const getBadgeStyle = (status: Appointment['Status']) => {
		switch (status) {
			case AppointmentStatus.PLANNED: {
				return 'bg-primary/10 text-primary';
			}

			case AppointmentStatus.PERFORMED: {
				return 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]';
			}

			case AppointmentStatus.CANCELLED: {
				return 'bg-destructive/10 text-destructive';
			}

			default: {
				return 'bg-muted/10 text-muted';
			}
		}
	};

	const getBadgeText = (status: Appointment['Status']) => {
		switch (status) {
			case AppointmentStatus.PLANNED: {
				return 'Prévu';
			}

			case AppointmentStatus.PERFORMED: {
				return 'Validé';
			}

			default: {
				return 'Annulé';
			}
		}
	};

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" onClick={goToPreviousMonth} className="bg-transparent">
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<h2 className="min-w-45 text-center text-lg font-semibold">
							{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
						</h2>

						<Button variant="outline" size="icon" onClick={goToNextMonth} className="bg-transparent">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>

					<Button variant="outline" size="sm" onClick={goToToday} className="bg-transparent">
						Aujourd'hui
					</Button>
				</div>
			</CardHeader>

			<CardContent>
				<div className="mb-4 grid grid-cols-7 gap-1">
					{DAYS.map((day) => (
						<div key={day} className="text-muted-foreground py-2 text-center text-xs font-medium">
							{day}
						</div>
					))}
					{calendarDays.map((date, index) => {
						if (!date) {
							return <div key={`empty-${String(index)}`} className="aspect-square" />;
						}

						const dayAppointments = appointmentsByDate.get(date.toDateString()) ?? [];
						const hasAppointments = dayAppointments.length > 0;

						return (
							<button
								key={date.toISOString()}
								type="button"
								onClick={() => onDateSelect(date)}
								className={cn(
									'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors',
									isSelected(date) && 'bg-primary text-primary-foreground',
									!isSelected(date) && isToday(date) && 'bg-primary/10 text-primary font-semibold',
									!isSelected(date) && !isToday(date) && 'hover:bg-muted',
									!isSelected(date) && date.getMonth() !== currentMonth.getMonth() && 'text-muted-foreground',
								)}
							>
								{date.getDate()}
								{hasAppointments && (
									<div className="mt-0.5 flex gap-0.5">
										{dayAppointments.slice(0, 3).map((apt) => (
											<div
												key={apt.Id}
												className={cn(
													'h-1.5 w-1.5 rounded-full',
													isSelected(date) ? 'bg-primary-foreground' : getStatusColor(apt.Status),
												)}
											/>
										))}
									</div>
								)}
							</button>
						);
					})}
				</div>

				<div className="border-border border-t pt-4">
					<h3 className="text-foreground mb-3 text-sm font-medium">
						{selectedDate.toLocaleDateString('fr-FR', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
						})}
					</h3>

					{selectedDateAppointments.length === 0 ? (
						<p className="text-muted-foreground py-4 text-center text-sm">Aucun rendez-vous ce jour</p>
					) : (
						<div className="space-y-2">
							{selectedDateAppointments.map((apt) => (
								<button
									key={apt.Id}
									type="button"
									onClick={() => onAppointmentSelect(apt)}
									className="bg-muted/50 hover:bg-muted flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
								>
									<div className={cn('h-10 w-1 rounded-full', getStatusColor(apt.Status))} />

									<div className="min-w-0 flex-1">
										<p className="text-foreground truncate text-sm font-medium">
											{apt.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte'}
										</p>
										<p className="text-muted-foreground truncate text-xs">
											{apt.Patient?.User ? `${apt.Patient.User.FirstName} ${apt.Patient.User.LastName}` : ''}
										</p>
									</div>

									<div className="text-right">
										<p className="text-foreground text-sm font-medium">
											{new Date(apt.AppointmentStartDate).toLocaleTimeString('fr-FR', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>

										<Badge variant="secondary" className={cn('text-xs', getBadgeStyle(apt.Status))}>
											{getBadgeText(apt.Status)}
										</Badge>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
