'use client';

import { useState } from 'react';

import { Scan, Shield } from 'lucide-react';

import { PendingValidations } from '@/components/qr-validation/pending-validations';
import { QRCodeDisplay } from '@/components/qr-validation/qr-code-display';
import { QRCodeScanner } from '@/components/qr-validation/qr-code-scanner';
import { Card, CardContent } from '@/components/ui/card';
import type { Appointment, User, UserRole } from '@/lib/types';

interface QRValidationPageContentProps {
	initialTodayAppointments: Appointment[];
	user: User | null;
	role: UserRole | null;
}

export function QRValidationPageContent({ initialTodayAppointments, user, role }: QRValidationPageContentProps) {
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
	const todayAppointments = initialTodayAppointments;

	if (!user || !role) {
		return null;
	}

	if (role === 'patient') {
		return (
			<div className="space-y-6">
				<Card className="bg-primary/5 border-l-primary border-0 border-l-4 shadow-sm">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<Shield className="text-primary mt-0.5 h-5 w-5" />

							<div>
								<p className="text-foreground font-medium">Validation sécurisée</p>
								<p className="text-muted-foreground text-sm">
									Présentez ce QR code à votre professionnel de santé pour valider votre soin. Le code se renouvelle
									automatiquement toutes les 30 secondes pour garantir la sécurité.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-6 lg:grid-cols-2">
					<QRCodeDisplay
						appointments={todayAppointments}
						selectedAppointmentId={selectedAppointmentId}
						onSelectAppointment={setSelectedAppointmentId}
					/>

					<PendingValidations
						appointments={todayAppointments}
						userRole={role}
						onSelect={setSelectedAppointmentId}
						selectedId={selectedAppointmentId}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card className="border-0 border-l-4 border-l-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-start gap-3">
						<Scan className="mt-0.5 h-5 w-5 text-[hsl(var(--accent))]" />

						<div>
							<p className="text-foreground font-medium">Scanner de validation</p>
							<p className="text-muted-foreground text-sm">
								Scannez le QR code présenté par votre patient pour valider l'acte de soin. Chaque code est unique et
								valide pendant 30 secondes.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<QRCodeScanner />

				<PendingValidations
					appointments={todayAppointments}
					userRole={role}
					onSelect={setSelectedAppointmentId}
					selectedId={selectedAppointmentId}
				/>
			</div>
		</div>
	);
}
