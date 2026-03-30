import { redirect } from 'next/navigation';

import { AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { serverValidateQrCode } from '@/lib/server-api';
import Link from 'next/link';

interface ValidateActPageProps {
	params: Promise<{ prescriptionHealthcareActId: string; token: string }>;
}

export default async function ValidateActPage({ params }: ValidateActPageProps) {
	const { prescriptionHealthcareActId, token } = await params;
	const id = parseInt(prescriptionHealthcareActId);

	if (isNaN(id)) {
		return <ErrorView message="Lien invalide." />;
	}

	const result = await serverValidateQrCode(id, token);

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
				<div className="rounded-full bg-destructive/10 p-6">
					<AlertTriangle className="h-12 w-12 text-destructive" />
				</div>
				<h1 className="text-xl font-semibold">Validation échouée</h1>
				<p className="text-muted-foreground max-w-xs text-sm">{message}</p>
			</div>
			<Button asChild variant="outline">
				<Link href="/dashboard">Retour au tableau de bord</Link>
			</Button>
		</div>
	);
}
