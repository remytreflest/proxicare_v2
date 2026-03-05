'use client';

import { useEffect, useState } from 'react';

import { Calendar, Loader2 } from 'lucide-react';

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
import { PrescriptionHealthcareActStatus, type Prescription } from '@/lib/types';

interface PlanAppointmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	prescription?: Prescription;
	onCreated: () => Promise<void> | void;
}

function toDatetimeLocalMin() {
	const now = new Date();
	now.setMinutes(now.getMinutes() + 5);

	return now.toISOString().slice(0, 16);
}

export function PlanAppointmentDialog({ open, onOpenChange, prescription, onCreated }: PlanAppointmentDialogProps) {
	const [prescriptions, setPrescriptions] = useState<Prescription[]>(prescription ? [prescription] : []);
	const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>(
		prescription ? String(prescription.Id) : '',
	);
	const [selectedActId, setSelectedActId] = useState<string>('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [isFetching, setIsFetching] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedPrescription = prescriptions.find((p) => String(p.Id) === selectedPrescriptionId);
	const plannableActs =
		selectedPrescription?.PrescriptionHealthcareActs?.filter(
			(act) => act.Status === PrescriptionHealthcareActStatus.TO_BE_PLANNED,
		) ?? [];

	const loadPrescriptions = async () => {
		try {
			const data = await fetchProfessionalPrescriptions();
			const withPlannableActs = data.filter((prescriptionWithActs) =>
				prescriptionWithActs.PrescriptionHealthcareActs?.some(
					(act) => act.Status === PrescriptionHealthcareActStatus.TO_BE_PLANNED,
				),
			);
			setPrescriptions(withPlannableActs);
		} finally {
			setIsFetching(false);
		}
	};

	useEffect(() => {
		if (!open) {
			return;
		}

		setSelectedActId('');
		setStartDate('');
		setEndDate('');
		setError(null);

		if (prescription) {
			setPrescriptions([prescription]);
			setSelectedPrescriptionId(String(prescription.Id));
		} else {
			setSelectedPrescriptionId('');
			setIsFetching(true);

			loadPrescriptions();
		}
	}, [open, prescription]);

	const handlePrescriptionChange = (value: string | null) => {
		if (value) {
			setSelectedPrescriptionId(value);
			setSelectedActId('');
		}
	};

	const handleSubmit = async () => {
		if (!selectedPrescription || !selectedActId || !startDate || !endDate) {
			setError('Veuillez remplir tous les champs.');

			return;
		}

		const patientId = selectedPrescription.Patient?.Id;

		if (!patientId) {
			setError('Impossible de trouver le patient associé à cette prescription.');

			return;
		}

		setIsSubmitting(true);
		setError(null);

		const result = await createAppointment({
			patientId,
			prescriptionHealthcareActId: Number(selectedActId),
			appointmentStartDate: new Date(startDate).toISOString(),
			appointmentEndDate: new Date(endDate).toISOString(),
		});

		if (result.error) {
			setError(result.error.message);
			setIsSubmitting(false);

			return;
		}

		onOpenChange(false);
		await onCreated();
		setIsSubmitting(false);
	};

	const minDatetime = toDatetimeLocalMin();
	const isFormValid = !!selectedPrescription && !!selectedActId && !!startDate && !!endDate;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Planifier un rendez-vous</DialogTitle>
					<DialogDescription>
						Planifiez un acte de soin pour un patient à partir d&apos;une prescription active.
					</DialogDescription>
				</DialogHeader>

				{isFetching && (
					<div className="flex justify-center py-8">
						<Loader2 className="text-primary h-6 w-6 animate-spin" />
					</div>
				)}
				{!isFetching && prescriptions.length === 0 ? (
					<div className="py-6 text-center">
						<Calendar className="text-muted-foreground/50 mx-auto mb-3 h-10 w-10" />
						<p className="text-muted-foreground text-sm">
							Aucun acte à planifier. Toutes les prescriptions actives sont déjà planifiées.
						</p>
					</div>
				) : (
					<div className="space-y-4 py-2">
						{!prescription && (
							<div className="space-y-2">
								<Label>Prescription</Label>
								<Select value={selectedPrescriptionId} onValueChange={handlePrescriptionChange}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Sélectionner une prescription" />
									</SelectTrigger>
									<SelectContent>
										{prescriptions.map((p) => {
											const patientName = p.Patient?.User
												? `${p.Patient.User.FirstName} ${p.Patient.User.LastName}`
												: p.SocialSecurityNumber;
											const dateRange = `${new Date(p.StartDate).toLocaleDateString('fr-FR')} → ${new Date(p.EndDate).toLocaleDateString('fr-FR')}`;

											return (
												<SelectItem key={p.Id} value={String(p.Id)}>
													{patientName} — {dateRange}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-2">
							<Label>Acte à planifier</Label>
							<Select
								value={selectedActId}
								onValueChange={(value) => {
									if (value) {
										setSelectedActId(value);
									}
								}}
								disabled={!selectedPrescription || plannableActs.length === 0}
							>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={plannableActs.length === 0 ? 'Aucun acte à planifier' : 'Sélectionner un acte'}
									/>
								</SelectTrigger>
								<SelectContent>
									{plannableActs.map((act) => (
										<SelectItem key={act.Id} value={String(act.Id)}>
											{act.HealthcareAct?.Name ?? `Acte #${String(act.Id)}`}
											{' — '}
											{act.OccurrencesPerDay}x/jour
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-2">
								<Label htmlFor="plan-start">Début</Label>
								<Input
									id="plan-start"
									type="datetime-local"
									value={startDate}
									min={minDatetime}
									onChange={(event_) => {
										setStartDate(event_.target.value);
										if (endDate && event_.target.value >= endDate) {
											setEndDate('');
										}
									}}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="plan-end">Fin</Label>
								<Input
									id="plan-end"
									type="datetime-local"
									value={endDate}
									min={startDate || minDatetime}
									onChange={(event_) => setEndDate(event_.target.value)}
									disabled={!startDate}
								/>
							</div>
						</div>

						{error && <p className="text-destructive text-sm">{error}</p>}
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
						Annuler
					</Button>
					{prescriptions.length > 0 && (
						<Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting || isFetching}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Planification…
								</>
							) : (
								<>
									<Calendar className="mr-2 h-4 w-4" />
									Planifier
								</>
							)}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
