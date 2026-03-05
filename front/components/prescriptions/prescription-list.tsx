'use client';

import { Calendar, ChevronRight, FileText } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppointmentStatus, type Prescription } from '@/lib/types';
import { cn, getPrescriptionStatus } from '@/lib/utils';

interface PrescriptionListProps {
	prescriptions: Prescription[];
	selectedId?: string;
	onSelect: (prescription: Prescription) => void;
}

const statusConfig = {
	active: { label: 'Active', className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' },
	completed: { label: 'Terminée', className: 'bg-muted text-muted-foreground' },
	expired: { label: 'Expirée', className: 'bg-destructive/10 text-destructive' },
};

function computeProgress(prescription: Prescription) {
	const acts = prescription.PrescriptionHealthcareActs ?? [];
	const start = new Date(prescription.StartDate);
	const end = new Date(prescription.EndDate);
	const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	const totalOccurrences = acts.reduce((accumulator, act) => accumulator + act.OccurrencesPerDay * totalDays, 0);
	const completedOccurrences = acts.reduce(
		(accumulator, act) =>
			accumulator +
			(act.Appointments?.filter((appointment) => appointment.Status === AppointmentStatus.PERFORMED).length ?? 0),
		0,
	);

	return { totalOccurrences, completedOccurrences };
}

export function PrescriptionList({ prescriptions, selectedId, onSelect }: PrescriptionListProps) {
	if (prescriptions.length === 0) {
		return (
			<Card className="border-0 shadow-sm">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<FileText className="text-muted-foreground/50 mb-4 h-12 w-12" />

					<h3 className="text-foreground mb-1 text-lg font-medium">Aucune prescription</h3>

					<p className="text-muted-foreground text-center text-sm">
						Aucune prescription ne correspond à vos critères de recherche.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-3">
			{prescriptions.map((prescription) => {
				const { totalOccurrences, completedOccurrences } = computeProgress(prescription);
				const progress = totalOccurrences > 0 ? (completedOccurrences / totalOccurrences) * 100 : 0;
				const isSelected = selectedId === String(prescription.Id);
				const computedStatus = getPrescriptionStatus(prescription);
				const status = statusConfig[computedStatus];
				const patientName = prescription.Patient?.User
					? `${prescription.Patient.User.FirstName} ${prescription.Patient.User.LastName}`
					: prescription.SocialSecurityNumber;
				const acts = prescription.PrescriptionHealthcareActs ?? [];

				return (
					<Card
						key={prescription.Id}
						className={cn(
							'cursor-pointer border-0 shadow-sm transition-all duration-200 hover:shadow-md',
							isSelected && 'ring-primary shadow-md ring-2',
						)}
						onClick={() => onSelect(prescription)}
					>
						<CardContent className="p-4">
							<div className="flex items-start gap-4">
								<Avatar className="h-10 w-10 shrink-0">
									<AvatarFallback className="bg-primary/10 text-primary text-sm">
										{patientName
											.split(' ')
											.map((n) => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>

								<div className="min-w-0 flex-1">
									<div className="mb-2 flex items-start justify-between gap-2">
										<div>
											<h3 className="text-foreground font-medium">{patientName}</h3>
										</div>

										<Badge variant="secondary" className={status.className}>
											{status.label}
										</Badge>
									</div>

									<div className="mb-3 flex flex-wrap gap-1">
										{acts.slice(0, 2).map((act) => (
											<span key={act.Id} className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
												{act.HealthcareAct?.Name ?? 'Acte'}
											</span>
										))}

										{acts.length > 2 && (
											<span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
												+{acts.length - 2}
											</span>
										)}
									</div>

									<div className="flex items-center justify-between gap-4">
										<div className="flex-1">
											<div className="mb-1 flex items-center justify-between text-xs">
												<span className="text-muted-foreground">Progression</span>
												<span className="text-foreground font-medium">{Math.round(progress)}%</span>
											</div>

											<Progress value={progress} className="h-1.5" />
										</div>

										<div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
											<Calendar className="h-3 w-3" />

											{new Date(prescription.EndDate).toLocaleDateString('fr-FR', {
												day: 'numeric',
												month: 'short',
											})}
										</div>

										<ChevronRight
											className={cn('text-muted-foreground h-4 w-4 transition-colors', isSelected && 'text-primary')}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
