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

function getRemainingCount(act: PrescriptionHealthcareAct, prescription: Prescription): number {
	const start = new Date(prescription.StartDate);
	const end = new Date(prescription.EndDate);
	const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	const total = act.OccurrencesPerDay * totalDays;
	const performed = act.Appointments?.filter((a) => a.Status === AppointmentStatus.PERFORMED).length ?? 0;
	const planned = act.Appointments?.filter((a) => a.Status === AppointmentStatus.PLANNED).length ?? 0;
	return Math.max(0, total - performed - planned);
}

export function PlanAppointmentDialog({
	open,
	onOpenChange,
	prescription: prescriptionProp,
	onCreated,
}: PlanAppointmentDialogProps) {
	const [prescriptions, setPrescriptions] = useState<Prescription[]>(prescriptionProp ? [prescriptionProp] : []);
	const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>(
		prescriptionProp ? String(prescriptionProp.Id) : '',
	);
	const [selectedActIds, setSelectedActIds] = useState<Set<number>>(new Set());
	const [selectedDateKeys, setSelectedDateKeys] = useState<Set<string>>(new Set());
	const [startTime, setStartTime] = useState('08:00');
	const [endTime, setEndTime] = useState('08:30');
	const [isFetching, setIsFetching] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedPrescription = prescriptions.find((p) => String(p.Id) === selectedPrescriptionId);

	const plannableActs = useMemo(
		() =>
			selectedPrescription?.PrescriptionHealthcareActs?.filter(
				(act) =>
					act.Status === PrescriptionHealthcareActStatus.TO_BE_PLANNED ||
					act.Status === PrescriptionHealthcareActStatus.PLANNED,
			) ?? [],
		[selectedPrescription],
	);

	const upcomingDays = useMemo(
		() => (selectedPrescription ? getUpcomingDays(selectedPrescription) : []),
		[selectedPrescription],
	);

	const totalToCreate = selectedActIds.size * selectedDateKeys.size;

	useEffect(() => {
		if (!open) return;

		setSelectedActIds(new Set());
		setSelectedDateKeys(new Set());
		setStartTime('08:00');
		setEndTime('08:30');
		setError(null);

		if (prescriptionProp) {
			setPrescriptions([prescriptionProp]);
			setSelectedPrescriptionId(String(prescriptionProp.Id));
		} else {
			setSelectedPrescriptionId('');
			setIsFetching(true);
			fetchProfessionalPrescriptions()
				.then((data) => {
					const withPlannableActs = data.filter((p) =>
						p.PrescriptionHealthcareActs?.some(
							(act) =>
								act.Status === PrescriptionHealthcareActStatus.TO_BE_PLANNED ||
								act.Status === PrescriptionHealthcareActStatus.PLANNED,
						),
					);
					setPrescriptions(withPlannableActs);
				})
				.finally(() => setIsFetching(false));
		}
	}, [open, prescriptionProp]);

	const toggleAct = (actId: number) => {
		setSelectedActIds((prev) => {
			const next = new Set(prev);
			if (next.has(actId)) next.delete(actId);
			else next.add(actId);
			return next;
		});
	};

	const toggleDate = (key: string) => {
		setSelectedDateKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const handleSubmit = async () => {
		if (!selectedPrescription || selectedActIds.size === 0 || selectedDateKeys.size === 0 || !startTime || !endTime) {
			setError('Veuillez sélectionner au moins un acte, un jour et une plage horaire.');
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

		const tasks = [...selectedActIds].flatMap((actId) =>
			[...selectedDateKeys].map((dateKey) => {
				const [y, m, d] = dateKey.split('-').map(Number);
				const start = new Date(y, m - 1, d, startH, startM);
				const end = new Date(y, m - 1, d, endH, endM);
				return createAppointment({
					patientId,
					prescriptionHealthcareActId: actId,
					appointmentStartDate: start.toISOString(),
					appointmentEndDate: end.toISOString(),
				});
			}),
		);

		const results = await Promise.all(tasks);
		const errorCount = results.filter((r) => r.error).length;

		if (errorCount > 0 && errorCount === results.length) {
			setError(`Aucun rendez-vous n'a pu être créé. Vérifiez les dates et les autorisations.`);
			setIsSubmitting(false);
			return;
		}

		if (errorCount > 0) {
			setError(`${String(errorCount)} rendez-vous n'ont pas pu être créés.`);
		}

		onOpenChange(false);
		await onCreated();
		setIsSubmitting(false);
	};

	const isFormValid = selectedActIds.size > 0 && selectedDateKeys.size > 0 && !!startTime && !!endTime;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Planifier des rendez-vous</DialogTitle>
					<DialogDescription>
						Sélectionnez les actes, les jours et l&apos;heure pour créer plusieurs rendez-vous en une fois.
					</DialogDescription>
				</DialogHeader>

				{isFetching ? (
					<div className="flex justify-center py-8">
						<Loader2 className="text-primary h-6 w-6 animate-spin" />
					</div>
				) : (
					<div className="space-y-5 py-2">
						{!prescriptionProp && (
							<div className="space-y-2">
								<Label>Prescription</Label>
								{prescriptions.length === 0 ? (
									<p className="text-muted-foreground text-sm">Aucune prescription avec des actes à planifier.</p>
								) : (
									<Select
										value={selectedPrescriptionId}
										onValueChange={(v) => {
											setSelectedPrescriptionId(v);
											setSelectedActIds(new Set());
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
														{name} — {new Date(p.StartDate).toLocaleDateString('fr-FR')} →{' '}
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
									<Label>Actes à planifier</Label>
									{plannableActs.length === 0 ? (
										<p className="text-muted-foreground text-sm">Aucun acte à planifier.</p>
									) : (
										<div className="space-y-2">
											{plannableActs.map((act) => {
												const remaining = getRemainingCount(act, selectedPrescription);
												const isSelected = selectedActIds.has(act.Id);

												return (
													<button
														key={act.Id}
														type="button"
														onClick={() => toggleAct(act.Id)}
														className={cn(
															'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
															isSelected
																? 'border-primary bg-primary/5'
																: 'border-border hover:border-primary/50',
														)}
													>
														<div className="flex items-center gap-2">
															<div
																className={cn(
																	'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
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
																remaining === 0 ? 'text-muted-foreground' : 'text-primary',
															)}
														>
															{remaining} restant{remaining > 1 ? 's' : ''}
														</span>
													</button>
												);
											})}
										</div>
									)}
								</div>

								<div className="space-y-2">
									<Label>Jours</Label>
									{upcomingDays.length === 0 ? (
										<p className="text-muted-foreground text-sm">Aucun jour disponible dans la période de la prescription.</p>
									) : (
										<div className="flex flex-wrap gap-2">
											{upcomingDays.map((date) => {
												const key = `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
												const isSelected = selectedDateKeys.has(key);
												const isToday = date.toDateString() === new Date().toDateString();

												return (
													<button
														key={key}
														type="button"
														onClick={() => toggleDate(key)}
														className={cn(
															'flex flex-col items-center rounded-lg border px-3 py-2 text-xs transition-all',
															isSelected
																? 'border-primary bg-primary text-primary-foreground'
																: isToday
																	? 'border-primary/50 bg-primary/5 text-primary'
																	: 'border-border hover:border-primary/50',
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

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-2">
										<Label htmlFor="start-time">Heure de début</Label>
										<Input
											id="start-time"
											type="time"
											value={startTime}
											onChange={(e) => setStartTime(e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="end-time">Heure de fin</Label>
										<Input
											id="end-time"
											type="time"
											value={endTime}
											onChange={(e) => setEndTime(e.target.value)}
										/>
									</div>
								</div>

								{totalToCreate > 0 && (
									<p className="text-muted-foreground text-sm">
										{totalToCreate} rendez-vous seront créés ({selectedActIds.size} acte
										{selectedActIds.size > 1 ? 's' : ''} × {selectedDateKeys.size} jour
										{selectedDateKeys.size > 1 ? 's' : ''})
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
