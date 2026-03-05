'use client';

import { useState } from 'react';
import Link from 'next/link';

import { ArrowLeft, Calendar, Clock } from 'lucide-react';

import { QRCodeDisplay } from '@/components/qr-validation/qr-code-display';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/lib/types';

interface MobileQRPageContentProps {
	initialTodayAppointments: Appointment[];
}

export function MobileQRPageContent({ initialTodayAppointments }: MobileQRPageContentProps) {
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

	const todayAppointments = initialTodayAppointments;

	return (
		<div className="from-primary/5 to-background min-h-screen bg-linear-to-b">
			<header className="bg-background/95 supports-backdrop-filter:bg-background/60 border-border sticky top-0 z-10 border-b backdrop-blur">
				<div className="flex items-center justify-between px-4 py-3">
					<Link href="/dashboard">
						<Button variant="ghost" size="sm" className="gap-1.5 bg-transparent">
							<ArrowLeft className="h-4 w-4" />
							Retour
						</Button>
					</Link>
					<h1 className="text-foreground font-semibold">Validation QR</h1>
					<div className="w-20" /> {/* Spacer */}
				</div>
			</header>

			<main className="container mx-auto max-w-md px-4 py-6">
				<div className="text-muted-foreground mb-6 flex items-center justify-center gap-2 text-sm">
					<Calendar className="h-4 w-4" />

					<span>
						{new Date().toLocaleDateString('fr-FR', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
						})}
					</span>
				</div>

				<QRCodeDisplay
					appointments={todayAppointments}
					selectedAppointmentId={selectedAppointmentId}
					onSelectAppointment={setSelectedAppointmentId}
				/>

				<div className="mt-6 space-y-3">
					<h3 className="text-foreground text-sm font-medium">Comment utiliser ce QR code ?</h3>

					<ol className="text-muted-foreground space-y-2 text-sm">
						<li className="flex items-start gap-2">
							<span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
								1
							</span>
							<span>Présentez le QR code à votre professionnel de santé</span>
						</li>

						<li className="flex items-start gap-2">
							<span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
								2
							</span>
							<span>Le professionnel scanne le code avec son application</span>
						</li>

						<li className="flex items-start gap-2">
							<span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium">
								3
							</span>
							<span>L&apos;acte de soin est automatiquement validé</span>
						</li>
					</ol>
				</div>

				{todayAppointments.length > 0 && (
					<div className="mt-8">
						<h3 className="text-foreground mb-3 text-sm font-medium">Rendez-vous du jour</h3>

						<div className="space-y-2">
							{todayAppointments.map((appointment) => {
								const actName = appointment.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte';
								const proName = appointment.HealthcareProfessional?.User
									? `${appointment.HealthcareProfessional.User.FirstName} ${appointment.HealthcareProfessional.User.LastName}`
									: 'Professionnel';
								const appointmentId = String(appointment.Id);

								return (
									<button
										key={appointmentId}
										type="button"
										onClick={() => setSelectedAppointmentId(appointmentId)}
										className={`w-full rounded-lg border p-3 text-left transition-all ${
											selectedAppointmentId === appointmentId
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'
										}`}
									>
										<div className="flex items-center justify-between">
											<div>
												<p className="text-foreground text-sm font-medium">{actName}</p>
												<p className="text-muted-foreground text-xs">{proName}</p>
											</div>

											<div className="text-muted-foreground flex items-center gap-1 text-xs">
												<Clock className="h-3 w-3" />

												{new Date(appointment.AppointmentStartDate).toLocaleTimeString('fr-FR', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
