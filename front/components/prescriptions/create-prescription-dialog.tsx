'use client';

import { useState } from 'react';

import { Minus, Plus, X } from 'lucide-react';

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
import { createPrescription } from '@/lib/api';
import type { HealthcareAct, HealthcareProfessional } from '@/lib/types';

interface CreatePrescriptionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialActs: HealthcareAct[];
	initialProfessionals: HealthcareProfessional[];
	onCreated?: () => void;
}

interface SelectedAct {
	actId: number;
	actName: string;
	occurrencesPerDay: number;
	totalDays: number;
}

export function CreatePrescriptionDialog({
	open,
	onOpenChange,
	initialActs,
	initialProfessionals,
	onCreated,
}: CreatePrescriptionDialogProps) {
	const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
	const [healthcareProfessionalId, setHealthcareProfessionalId] = useState('');
	const [selectedActs, setSelectedActs] = useState<SelectedAct[]>([]);
	const [validFrom, setValidFrom] = useState('');
	const [validUntil, setValidUntil] = useState('');
	const acts = initialActs;
	const professionals = initialProfessionals;
	const [submitting, setSubmitting] = useState(false);

	const handleAddAct = (actIdString: string) => {
		const actId = Number(actIdString);
		const act = acts.find((act) => act.Id === actId);

		if (act && !selectedActs.some((selectedAct) => selectedAct.actId === actId)) {
			setSelectedActs([
				...selectedActs,
				{
					actId: act.Id,
					actName: act.Name,
					occurrencesPerDay: 1,
					totalDays: 7,
				},
			]);
		}
	};

	const handleRemoveAct = (actId: number) => {
		setSelectedActs(selectedActs.filter((selectedAct) => selectedAct.actId !== actId));
	};

	const handleUpdateAct = (actId: number, field: 'occurrencesPerDay' | 'totalDays', value: number) => {
		setSelectedActs(
			selectedActs.map((selectedAct) =>
				selectedAct.actId === actId ? { ...selectedAct, [field]: Math.max(1, value) } : selectedAct,
			),
		);
	};

	const resetForm = () => {
		setSocialSecurityNumber('');
		setHealthcareProfessionalId('');
		setSelectedActs([]);
		setValidFrom('');
		setValidUntil('');
	};

	const handleSubmit = async () => {
		setSubmitting(true);

		try {
			await createPrescription({
				socialSecurityNumber,
				healthcareProfessionalId: Number(healthcareProfessionalId),
				startDate: validFrom,
				endDate: validUntil,
				acts: selectedActs.map((a) => ({ id: a.actId, occurrencesPerDay: a.occurrencesPerDay })),
			});

			onOpenChange(false);
			resetForm();
			onCreated?.();
		} catch (error) {
			console.error('Failed to create prescription', error);
		} finally {
			setSubmitting(false);
		}
	};

	const isValid =
		socialSecurityNumber && healthcareProfessionalId && selectedActs.length > 0 && validFrom && validUntil;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Nouvelle prescription</DialogTitle>
					<DialogDescription>Créez une nouvelle prescription pour un patient</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="ssn">Numéro de sécurité sociale du patient</Label>
						<Input
							id="ssn"
							placeholder="Ex : 1 85 05 78 006 084 36"
							value={socialSecurityNumber}
							onChange={(event_) => setSocialSecurityNumber(event_.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="professional">Professionnel de santé</Label>
						<Select
							value={healthcareProfessionalId}
							onValueChange={(v) => {
								if (v) {
									setHealthcareProfessionalId(v);
								}
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Sélectionnez un professionnel" />
							</SelectTrigger>

							<SelectContent>
								{professionals.map((pro) => (
									<SelectItem key={pro.Id} value={String(pro.Id)}>
										Professionnel #{pro.Id} — {pro.Speciality ?? 'N/A'}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="validFrom">Date de début</Label>
							<Input
								id="validFrom"
								type="date"
								value={validFrom}
								onChange={(event_) => setValidFrom(event_.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="validUntil">Date de fin</Label>
							<Input
								id="validUntil"
								type="date"
								value={validUntil}
								onChange={(event_) => setValidUntil(event_.target.value)}
							/>
						</div>
					</div>

					<div className="space-y-3">
						<Label>Actes de soins</Label>
						<Select
							onValueChange={(value: string | null) => {
								if (value) {
									handleAddAct(value);
								}
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Ajouter un acte" />
							</SelectTrigger>
							<SelectContent>
								{acts
									.filter((act) => !selectedActs.some((selectedAct) => selectedAct.actId === act.Id))
									.map((act) => (
										<SelectItem key={act.Id} value={String(act.Id)}>
											{act.Name} ({act.Price} €)
										</SelectItem>
									))}
							</SelectContent>
						</Select>

						{selectedActs.length > 0 && (
							<div className="mt-4 space-y-3">
								{selectedActs.map((selectedAct) => (
									<div
										key={selectedAct.actId}
										className="border-border bg-card flex items-center gap-4 rounded-lg border p-4"
									>
										<div className="flex-1">
											<p className="text-foreground font-medium">{selectedAct.actName}</p>
											<div className="mt-2 flex items-center gap-4">
												<div className="flex items-center gap-2">
													<span className="text-muted-foreground text-xs">Par jour:</span>

													<div className="flex items-center">
														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-7 w-7 bg-transparent"
															onClick={() =>
																handleUpdateAct(
																	selectedAct.actId,
																	'occurrencesPerDay',
																	selectedAct.occurrencesPerDay - 1,
																)
															}
														>
															<Minus className="h-3 w-3" />
														</Button>

														<span className="w-8 text-center text-sm font-medium">{selectedAct.occurrencesPerDay}</span>

														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-7 w-7 bg-transparent"
															onClick={() =>
																handleUpdateAct(
																	selectedAct.actId,
																	'occurrencesPerDay',
																	selectedAct.occurrencesPerDay + 1,
																)
															}
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
												</div>

												<div className="flex items-center gap-2">
													<span className="text-muted-foreground text-xs">Jours:</span>

													<div className="flex items-center">
														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-7 w-7 bg-transparent"
															onClick={() => handleUpdateAct(selectedAct.actId, 'totalDays', selectedAct.totalDays - 1)}
														>
															<Minus className="h-3 w-3" />
														</Button>

														<span className="w-8 text-center text-sm font-medium">{selectedAct.totalDays}</span>

														<Button
															type="button"
															variant="outline"
															size="icon"
															className="h-7 w-7 bg-transparent"
															onClick={() => handleUpdateAct(selectedAct.actId, 'totalDays', selectedAct.totalDays + 1)}
														>
															<Plus className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</div>

											<p className="text-muted-foreground mt-2 text-xs">
												Total: {selectedAct.occurrencesPerDay * selectedAct.totalDays} occurrences
											</p>
										</div>

										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="shrink-0"
											onClick={() => handleRemoveAct(selectedAct.actId)}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
						Annuler
					</Button>

					<Button onClick={handleSubmit} disabled={!isValid || submitting}>
						{submitting ? 'Création…' : 'Créer la prescription'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
