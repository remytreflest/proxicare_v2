'use client';

import { useState } from 'react';

import { PendingValidations } from '@/components/qr-validation/pending-validations';
import { QRCodeDisplay } from '@/components/qr-validation/qr-code-display';
import { QRCodeScanner } from '@/components/qr-validation/qr-code-scanner';
import type { Appointment, User, UserRole } from '@/lib/types';

interface QRValidationPageContentProps {
	initialTodayAppointments: Appointment[];
	user: User | null;
	role: UserRole | null;
}

export function QRValidationPageContent({ initialTodayAppointments, user, role }: QRValidationPageContentProps) {
	const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
	const [appointments, setAppointments] = useState(initialTodayAppointments);

	const handleActValidated = (appointmentId: string) => {
		setAppointments((previous) => previous.filter((a) => String(a.Id) !== appointmentId));
		setSelectedAppointmentId(null);
	};

	const todayAppointments = appointments;

	if (!user || !role) {
		return null;
	}

	if (role === 'patient') {
		return (
			<div className="grid gap-6 lg:grid-cols-2">
				<QRCodeDisplay
					appointments={todayAppointments}
					selectedAppointmentId={selectedAppointmentId}
					onSelectAppointment={setSelectedAppointmentId}
					onActValidated={handleActValidated}
				/>

				<PendingValidations
					appointments={todayAppointments}
					userRole={role}
					onSelect={setSelectedAppointmentId}
					selectedId={selectedAppointmentId}
				/>
			</div>
		);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<QRCodeScanner />

			<PendingValidations
				appointments={todayAppointments}
				userRole={role}
				onSelect={setSelectedAppointmentId}
				selectedId={selectedAppointmentId}
			/>
		</div>
	);
}
