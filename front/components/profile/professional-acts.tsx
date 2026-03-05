'use client';

import React, { useState } from 'react';

import { Check, Euro, Loader2, Stethoscope } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { associateActToProfessional, dissociateActFromProfessional } from '@/lib/api';
import type { HealthcareAct } from '@/lib/types';

interface ProfessionalActsProps {
	initialAllActs: HealthcareAct[];
	initialUserActs: HealthcareAct[];
}

export function ProfessionalActs({ initialAllActs, initialUserActs }: ProfessionalActsProps) {
	const [allActs] = useState<HealthcareAct[]>(initialAllActs);
	const [initialSelectedIds, setInitialSelectedIds] = useState<number[]>(initialUserActs.map((a) => a.Id));
	const [selectedIds, setSelectedIds] = useState<number[]>(initialUserActs.map((a) => a.Id));
	const [isSaving, setIsSaving] = useState(false);

	const handleToggleAct = (actId: number) => {
		setSelectedIds((previous) =>
			previous.includes(actId) ? previous.filter((id) => id !== actId) : [...previous, actId],
		);
	};

	const handleSave = async () => {
		setIsSaving(true);

		try {
			const toAssociate = selectedIds.filter((id) => !initialSelectedIds.includes(id));
			const toDissociate = initialSelectedIds.filter((id) => !selectedIds.includes(id));

			await Promise.all([
				...toAssociate.map((id) => associateActToProfessional(id)),
				...toDissociate.map((id) => dissociateActFromProfessional(id)),
			]);

			setInitialSelectedIds([...selectedIds]);
		} catch (error) {
			console.error('Failed to save acts', error);
		} finally {
			setIsSaving(false);
		}
	};

	const hasChanges =
		selectedIds.length !== initialSelectedIds.length || !selectedIds.every((id) => initialSelectedIds.includes(id));

	return (
		<div className="space-y-6">
			<Card className="border-0 border-l-4 border-l-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-start gap-3">
						<Stethoscope className="mt-0.5 h-5 w-5 text-[hsl(var(--accent))]" />

						<div>
							<p className="text-foreground font-medium">Catalogue d'actes</p>
							<p className="text-muted-foreground text-sm">
								Sélectionnez les actes que vous êtes habilité(e) à réaliser. Seuls ces actes vous seront proposés lors
								de la planification des soins.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="bg-primary/10 rounded-xl p-3">
								<Stethoscope className="text-primary h-6 w-6" />
							</div>

							<div>
								<p className="text-foreground text-2xl font-bold">{selectedIds.length}</p>
								<p className="text-muted-foreground text-sm">Actes sélectionnés sur {allActs.length}</p>
							</div>
						</div>

						<Button onClick={handleSave} disabled={!hasChanges || isSaving}>
							{isSaving ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Enregistrement...
								</>
							) : (
								<>
									<Check className="mr-2 h-4 w-4" />
									Enregistrer
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Acts list */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center justify-between text-base">
						<span className="flex items-center gap-2">
							<Stethoscope className="text-primary h-5 w-5" />
							Tous les actes
						</span>

						<Badge variant="secondary" className="bg-primary/10 text-primary">
							{selectedIds.length}/{allActs.length}
						</Badge>
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					{allActs.map((act, index) => {
						const isSelected = selectedIds.includes(act.Id);

						return (
							<div key={act.Id}>
								{index > 0 && <Separator className="mb-3" />}

								<div className="flex items-start gap-3">
									<Checkbox
										id={String(act.Id)}
										checked={isSelected}
										onCheckedChange={() => handleToggleAct(act.Id)}
										className="mt-1"
									/>

									<div className="flex-1">
										<Label htmlFor={String(act.Id)} className="text-foreground cursor-pointer text-sm font-medium">
											{act.Name}
										</Label>

										<p className="text-muted-foreground mt-0.5 text-xs">{act.Description}</p>

										<div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
											<Euro className="h-3 w-3" />
											{act.Price} €
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}
