import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { serverValidateQrCode } from '@/lib/server-api';

interface ValidateActPageProps {
	params: Promise<{ prescriptionHealthcareActId: string; appointmentId: string; token: string }>;
}

export default async function ValidateActPage({ params }: ValidateActPageProps) {
	const { prescriptionHealthcareActId, appointmentId, token } = await params;
	const id = parseInt(prescriptionHealthcareActId);
	const apptId = parseInt(appointmentId);

	if (isNaN(id) || isNaN(apptId)) {
		return <ErrorView message="Lien invalide." />;
	}

	const result = await serverValidateQrCode(id, apptId, token);

	if (result.success) {
		const { healthcareAct, patientName } = result.data;
		redirect(
			`/validate-act/success?act=${encodeURIComponent(healthcareAct ?? '')}&patient=${encodeURIComponent(patientName ?? '')}`,
		);
	}

	return <ErrorView message={result.error} />;
}

function ErrorView({ message }: { message: string }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="bg-destructive/10 rounded-full p-6">
					<AlertTriangle className="text-destructive h-12 w-12" />
				</div>
				<h1 className="text-xl font-semibold">Validation échouée</h1>
				<p className="text-muted-foreground max-w-xs text-sm">{message}</p>
			</div>
			<Button
				variant="outline"
				render={<Link href="/dashboard">Retour au tableau de bord</Link>}
				nativeButton={false}
			/>
		</div>
	);
}
