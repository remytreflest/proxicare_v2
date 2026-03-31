'use client';

import { useEffect, useMemo, useState } from 'react';

import { Calendar, Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createAppointment, fetchProfessionalPrescriptions } from '@/lib/api';
import {
	AppointmentStatus,
	PrescriptionHealthcareActStatus,
	type Prescription,
	type PrescriptionHealthcareAct,
} from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlanAppointmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	prescription?: Prescription;
	onCreated: () => Promise<void> | void;
}

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function getUpcomingDays(prescription: Prescription, count = 14): Date[] {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const end = new Date(prescription.EndDate);
	end.setHours(23, 59, 59, 999);
	const start = new Date(prescription.StartDate);
	start.setHours(0, 0, 0, 0);

	const days: Date[] = [];
	const cursor = new Date(Math.max(today.getTime(), start.getTime()));

	while (days.length < count && cursor <= end) {
		days.push(new Date(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}

	return days;
}

function getRemainingCount(prescriptionHealthcareAct: PrescriptionHealthcareAct, prescription: Prescription): number {
	let totalDays: number;

	if (prescriptionHealthcareAct.TotalDays != null && prescriptionHealthcareAct.TotalDays > 0) {
		totalDays = prescriptionHealthcareAct.TotalDays;
	} else {
		const start = new Date(prescription.StartDate);
		const end = new Date(prescription.EndDate);

		totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	}

	const total = prescriptionHealthcareAct.OccurrencesPerDay * totalDays;
	const performed =
		prescriptionHealthcareAct.Appointments?.filter((appointment) => appointment.Status === AppointmentStatus.PERFORMED)
			.length ?? 0;
	const planned =
		prescriptionHealthcareAct.Appointments?.filter((appointment) => appointment.Status === AppointmentStatus.PLANNED)
			.length ?? 0;

	return Math.max(0, total - performed - planned);
}

export function PlanAppointmentDialog({ open, onOpenChange, prescription, onCreated }: PlanAppointmentDialogProps) {
	const [prescriptions, setPrescriptions] = useState<Prescription[]>(prescription ? [prescription] : []);
	const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(
		prescription ? String(prescription.Id) : null,
	);
	const [selectedActId, setSelectedActId] = useState<number | null>(null);
	const [selectedDateKeys, setSelectedDateKeys] = useState<Set<string>>(new Set());
	const [startTime, setStartTime] = useState('08:00');
	const [endTime, setEndTime] = useState('08:30');
	const [isFetching, setIsFetching] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedPrescription = prescriptions.find(
		(temporaryPrescription) => String(temporaryPrescription.Id) === (selectedPrescriptionId ?? ''),
	);

	const plannableActs = useMemo(
		() =>
			selectedPrescription?.PrescriptionHealthcareActs?.filter((act) =>
				[PrescriptionHealthcareActStatus.TO_BE_PLANNED, PrescriptionHealthcareActStatus.PLANNED].includes(act.Status),
			) ?? [],
		[selectedPrescription],
	);

	const upcomingDays = useMemo(
		() => (selectedPrescription ? getUpcomingDays(selectedPrescription) : []),
		[selectedPrescription],
	);

	const selectedAct = plannableActs.find((plannableAct) => plannableAct.Id === selectedActId) ?? null;

	const dynamicRemaining = useMemo(() => {
		if (!selectedAct || !selectedPrescription) {
			return null;
		}

		const base = getRemainingCount(selectedAct, selectedPrescription);

		return Math.max(0, base - selectedDateKeys.size);
	}, [selectedAct, selectedPrescription, selectedDateKeys]);

	const totalToCreate = selectedActId ? selectedDateKeys.size : 0;

	useEffect(() => {
		if (!open) {
			return;
		}

		setSelectedActId(null);
		setSelectedDateKeys(new Set());
		setStartTime('08:00');
		setEndTime('08:30');
		setError(null);

		if (prescription) {
			setPrescriptions([prescription]);
			setSelectedPrescriptionId(String(prescription.Id));
		} else {
			setSelectedPrescriptionId(null);
			setIsFetching(true);
			fetchProfessionalPrescriptions()
				.then((data) => {
					const withPlannableActs = data.filter((prescriptionWithPlannableActs) =>
						prescriptionWithPlannableActs.PrescriptionHealthcareActs?.some((act) =>
							[PrescriptionHealthcareActStatus.TO_BE_PLANNED, PrescriptionHealthcareActStatus.PLANNED].includes(
								act.Status,
							),
						),
					);
					setPrescriptions(withPlannableActs);
				})
				.finally(() => setIsFetching(false));
		}
	}, [open, prescription]);

	const handleSelectAct = (actId: number) => {
		if (selectedActId === actId) {
			setSelectedActId(null);
			setSelectedDateKeys(new Set());
		} else {
			setSelectedActId(actId);
			setSelectedDateKeys(new Set());
		}
	};

	const toggleDate = (key: string) => {
		if (!selectedActId) {
			return;
		}

		const base = selectedAct && selectedPrescription ? getRemainingCount(selectedAct, selectedPrescription) : 0;

		setSelectedDateKeys((previous) => {
			const next = new Set(previous);

			if (next.has(key)) {
				next.delete(key);
			} else if (next.size < base) {
				next.add(key);
			}

			return next;
		});
	};

	const handleSubmit = async () => {
		if (!selectedPrescription || selectedActId === null || selectedDateKeys.size === 0 || !startTime || !endTime) {
			setError('Veuillez sélectionner un acte, au moins un jour et une plage horaire.');

			return;
		}

		if (startTime >= endTime) {
			setError("L'heure de fin doit être après l'heure de début.");

			return;
		}

		const patientId = selectedPrescription.Patient?.Id;

		if (!patientId) {
			setError('Impossible de trouver le patient associé.');

			return;
		}

		setIsSubmitting(true);
		setError(null);

		const [startH, startM] = startTime.split(':').map(Number);
		const [endH, endM] = endTime.split(':').map(Number);

		const tasks = [...selectedDateKeys].map((dateKey) => {
			const [year, month, day] = dateKey.split('-').map(Number);
			const start = new Date(year, month - 1, day, startH, startM);
			const end = new Date(year, month - 1, day, endH, endM);

			return createAppointment({
				patientId,
				prescriptionHealthcareActId: selectedActId,
				appointmentStartDate: start.toISOString(),
				appointmentEndDate: end.toISOString(),
			});
		});

		const results = await Promise.all(tasks);
		const errorCount = results.filter((result) => result.error).length;

		if (errorCount > 0 && errorCount === results.length) {
			setError("Aucun rendez-vous n'a pu être créé. Vérifiez les dates et les autorisations.");
			setIsSubmitting(false);

			return;
		}

		if (errorCount > 0) {
			setError(`${String(errorCount)} rendez-vous n'ont pas pu être créés.`);
		}

		await onCreated();

		onOpenChange(false);
		setIsSubmitting(false);
	};

	const isFormValid = selectedActId !== null && selectedDateKeys.size > 0 && !!startTime && !!endTime;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Planifier des rendez-vous</DialogTitle>
					<DialogDescription>
						Sélectionnez un acte, les jours et l&apos;heure pour créer plusieurs rendez-vous en une fois.
					</DialogDescription>
				</DialogHeader>

				{isFetching ? (
					<div className="flex justify-center py-8">
						<Loader2 className="text-primary h-6 w-6 animate-spin" />
					</div>
				) : (
					<div className="space-y-5 py-2">
						{!prescription && (
							<div className="space-y-2">
								<Label>Prescription</Label>
								{prescriptions.length === 0 ? (
									<p className="text-muted-foreground text-sm">Aucune prescription avec des actes à planifier.</p>
								) : (
									<Select
										value={selectedPrescriptionId ?? ''}
										onValueChange={(value) => {
											setSelectedPrescriptionId(value);
											setSelectedActId(null);
											setSelectedDateKeys(new Set());
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Sélectionner une prescription" />
										</SelectTrigger>
										<SelectContent>
											{prescriptions.map((p) => {
												const name = p.Patient?.User
													? `${p.Patient.User.FirstName} ${p.Patient.User.LastName}`
													: p.SocialSecurityNumber;

												return (
													<SelectItem key={p.Id} value={String(p.Id)}>
														{name} - {new Date(p.StartDate).toLocaleDateString('fr-FR')} →{' '}
														{new Date(p.EndDate).toLocaleDateString('fr-FR')}
													</SelectItem>
												);
											})}
										</SelectContent>
									</Select>
								)}
							</div>
						)}

						{selectedPrescription && (
							<>
								<div className="space-y-2">
									<Label>Acte à planifier</Label>
									{plannableActs.length === 0 ? (
										<p className="text-muted-foreground text-sm">Aucun acte à planifier.</p>
									) : (
										<div className="space-y-2">
											{plannableActs.map((act) => {
												const base = getRemainingCount(act, selectedPrescription);
												const isSelected = selectedActId === act.Id;
												const isDisabled = selectedActId !== null && !isSelected;
												const displayRemaining = isSelected && dynamicRemaining !== null ? dynamicRemaining : base;

												return (
													<button
														key={act.Id}
														type="button"
														onClick={() => handleSelectAct(act.Id)}
														disabled={isDisabled}
														className={cn(
															'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
															isSelected && 'border-primary bg-primary/5',
															isDisabled && 'cursor-not-allowed opacity-40',
															!isSelected && !isDisabled && 'border-border hover:border-primary/50',
														)}
													>
														<div className="flex items-center gap-2">
															<div
																className={cn(
																	'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
																	isSelected ? 'border-primary bg-primary' : 'border-muted-foreground',
																)}
															>
																{isSelected && <Check className="h-3 w-3 text-white" />}
															</div>
															<span className="text-foreground font-medium">
																{act.HealthcareAct?.Name ?? `Acte #${String(act.Id)}`}
															</span>
															<span className="text-muted-foreground text-xs">{act.OccurrencesPerDay}x/jour</span>
														</div>
														<span
															className={cn(
																'text-xs font-medium',
																displayRemaining === 0 ? 'text-muted-foreground' : 'text-primary',
															)}
														>
															{displayRemaining} restant{displayRemaining > 1 ? 's' : ''}
														</span>
													</button>
												);
											})}
										</div>
									)}
								</div>

								{selectedActId !== null && (
									<div className="space-y-2">
										<Label>
											Jours
											{selectedAct && (
												<span className="text-muted-foreground ml-2 text-xs font-normal">
													(max {getRemainingCount(selectedAct, selectedPrescription)} jour
													{getRemainingCount(selectedAct, selectedPrescription) > 1 ? 's' : ''})
												</span>
											)}
										</Label>
										{upcomingDays.length === 0 ? (
											<p className="text-muted-foreground text-sm">Aucun jour disponible.</p>
										) : (
											<div className="flex flex-wrap gap-2">
												{upcomingDays.map((date) => {
													const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
													const isSelected = selectedDateKeys.has(key);
													const isToday = date.toDateString() === new Date().toDateString();
													const base = selectedAct ? getRemainingCount(selectedAct, selectedPrescription) : 0;
													const isDisabled = !isSelected && selectedDateKeys.size >= base;

													return (
														<button
															key={key}
															type="button"
															onClick={() => toggleDate(key)}
															disabled={isDisabled}
															className={cn(
																'flex flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all',
																isSelected && 'border-primary bg-primary text-primary-foreground',
																isDisabled && 'cursor-not-allowed opacity-30',
																!isSelected && !isDisabled && 'hover:border-primary/50',
																!isSelected && isToday && !isDisabled
																	? 'border-primary/50 bg-primary/5 text-primary'
																	: 'border-border',
															)}
														>
															<span className="font-medium">{DAYS_FR[date.getDay()]}</span>
															<span>
																{String(date.getDate()).padStart(2, '0')}/{String(date.getMonth() + 1).padStart(2, '0')}
															</span>
														</button>
													);
												})}
											</div>
										)}
									</div>
								)}

								{selectedActId !== null && (
									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-2">
											<Label htmlFor="start-time">Heure de début</Label>
											<Input
												id="start-time"
												type="time"
												value={startTime}
												onChange={(event) => setStartTime(event.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="end-time">Heure de fin</Label>
											<Input
												id="end-time"
												type="time"
												value={endTime}
												onChange={(event) => setEndTime(event.target.value)}
											/>
										</div>
									</div>
								)}

								{totalToCreate > 0 && (
									<p className="text-muted-foreground text-sm">
										{totalToCreate} rendez-vous seront créés ({totalToCreate} jour
										{totalToCreate > 1 ? 's' : ''})
									</p>
								)}
							</>
						)}

						{error && <p className="text-destructive text-sm">{error}</p>}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					{selectedPrescription && (
						<Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting || isFetching}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Création…
								</>
							) : (
								<>
									<Calendar className="mr-2 h-4 w-4" />
									Planifier {totalToCreate > 0 ? `(${String(totalToCreate)})` : ''}
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
