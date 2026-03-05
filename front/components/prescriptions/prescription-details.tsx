'use client';

import { useState } from 'react';

import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, MoreVertical, Printer, User } from 'lucide-react';

import { PlanAppointmentDialog } from '@/components/appointments/plan-appointment-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AppointmentStatus, type Prescription, type UserRole } from '@/lib/types';
import { getPrescriptionStatus } from '@/lib/utils';

interface PrescriptionDetailsProps {
	prescription: Prescription | null;
	userRole: UserRole;
	onPlanningDone?: () => Promise<void> | void;
}

const statusConfig = {
	active: { label: 'Active', icon: Clock, className: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' },
	completed: { label: 'Terminée', icon: CheckCircle2, className: 'bg-muted text-muted-foreground' },
	expired: { label: 'Expirée', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
};

export function PrescriptionDetails({ prescription, userRole, onPlanningDone }: PrescriptionDetailsProps) {
	const [isPlanOpen, setIsPlanOpen] = useState(false);
	if (!prescription) {
		return (
			<Card className="sticky top-24 border-0 shadow-sm">
				<CardContent className="flex flex-col items-center justify-center py-12">
					<FileText className="text-muted-foreground/50 mb-4 h-12 w-12" />
					<h3 className="text-foreground mb-1 text-lg font-medium">Sélectionnez une prescription</h3>
					<p className="text-muted-foreground text-center text-sm">
						Cliquez sur une prescription pour voir ses détails
					</p>
				</CardContent>
			</Card>
		);
	}

	const computedStatus = getPrescriptionStatus(prescription);
	const status = statusConfig[computedStatus];
	const StatusIcon = status.icon;

	const acts = prescription.PrescriptionHealthcareActs ?? [];
	const start = new Date(prescription.StartDate);
	const end = new Date(prescription.EndDate);
	const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	const totalOccurrences = acts.reduce((accumulator, act) => accumulator + act.OccurrencesPerDay * totalDays, 0);
	const completedOccurrences = acts.reduce(
		(accumulator, act) =>
			accumulator + (act.Appointments?.filter((ap) => ap.Status === AppointmentStatus.PERFORMED).length ?? 0),
		0,
	);
	const overallProgress = totalOccurrences > 0 ? (completedOccurrences / totalOccurrences) * 100 : 0;

	const patientName = prescription.Patient?.User
		? `${prescription.Patient.User.FirstName} ${prescription.Patient.User.LastName}`
		: prescription.SocialSecurityNumber;

	return (
		<>
			<Card className="sticky top-24 border-0 shadow-sm">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<CardTitle className="text-lg">Détails de la prescription</CardTitle>

						<DropdownMenu>
							<DropdownMenuTrigger>
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end">
								<DropdownMenuItem>
									<Printer className="mr-2 h-4 w-4" />
									Imprimer
								</DropdownMenuItem>

								{(userRole === 'structure' || userRole === 'admin') && (
									<>
										<DropdownMenuItem>Modifier</DropdownMenuItem>
										<DropdownMenuItem className="text-destructive">Annuler</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="flex items-center gap-2">
						<Badge variant="secondary" className={`${status.className} gap-1`}>
							<StatusIcon className="h-3 w-3" />
							{status.label}
						</Badge>

						<span className="text-muted-foreground text-xs">ID: {prescription.Id}</span>
					</div>

					<Separator />

					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 rounded-lg p-2">
								<User className="text-primary h-4 w-4" />
							</div>

							<div>
								<p className="text-muted-foreground text-xs">Patient</p>
								<p className="text-foreground text-sm font-medium">{patientName}</p>
							</div>
						</div>
					</div>

					<Separator />

					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-[hsl(var(--warning))]/10 p-2">
							<Calendar className="h-4 w-4 text-[hsl(var(--warning))]" />
						</div>

						<div>
							<p className="text-muted-foreground text-xs">Période de validité</p>
							<p className="text-foreground text-sm font-medium">
								{start.toLocaleDateString('fr-FR')} - {end.toLocaleDateString('fr-FR')}
							</p>
						</div>
					</div>

					<Separator />

					<div>
						<div className="mb-2 flex items-center justify-between text-sm">
							<span className="text-muted-foreground">Progression globale</span>
							<span className="text-foreground font-medium">
								{completedOccurrences}/{totalOccurrences} actes
							</span>
						</div>

						<Progress value={overallProgress} className="h-2" />
					</div>

					<Separator />

					<div>
						<h4 className="text-foreground mb-3 text-sm font-medium">Actes prescrits</h4>
						<div className="space-y-3">
							{acts.map((act) => {
								const actTotal = act.OccurrencesPerDay * totalDays;
								const actCompleted =
									act.Appointments?.filter((appointment) => appointment.Status === AppointmentStatus.PERFORMED)
										.length ?? 0;
								const actProgress = actTotal > 0 ? (actCompleted / actTotal) * 100 : 0;

								return (
									<div key={act.Id} className="bg-muted/50 rounded-lg p-3">
										<div className="mb-2 flex items-start justify-between">
											<div>
												<p className="text-foreground text-sm font-medium">{act.HealthcareAct?.Name ?? 'Acte'}</p>
												<p className="text-muted-foreground text-xs">{act.OccurrencesPerDay}x par jour</p>
											</div>

											<span className="text-foreground text-xs font-medium">
												{actCompleted}/{actTotal}
											</span>
										</div>

										<Progress value={actProgress} className="h-1.5" />
									</div>
								);
							})}
						</div>
					</div>

					{userRole === 'professional' && computedStatus === 'active' && (
						<>
							<Separator />

							<Button className="w-full" onClick={() => setIsPlanOpen(true)}>
								<Calendar className="mr-2 h-4 w-4" />
								Planifier les actes
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			<PlanAppointmentDialog
				open={isPlanOpen}
				onOpenChange={setIsPlanOpen}
				prescription={prescription}
				onCreated={async () => {
					await onPlanningDone?.();
				}}
			/>
		</>
	);
}
