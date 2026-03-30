import Link from 'next/link';

import { CheckCircle2, ClipboardList, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ValidateSuccessPageProps {
	searchParams: Promise<{ act?: string; patient?: string }>;
}

export default async function ValidateSuccessPage({ searchParams }: ValidateSuccessPageProps) {
	const { act, patient } = await searchParams;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
			<div className="flex flex-col items-center gap-3 text-center">
				<div className="rounded-full bg-green-500/10 p-6">
					<CheckCircle2 className="h-14 w-14 text-green-500" />
				</div>
				<h1 className="text-2xl font-bold">Soin validé !</h1>
				<p className="text-muted-foreground text-sm">L&apos;acte a été enregistré avec succès.</p>
			</div>

			<Card className="w-full max-w-sm border-0 shadow-sm">
				<CardContent className="space-y-4 pt-6">
					{patient && (
						<div className="flex items-center gap-3">
							<div className="bg-primary/10 rounded-lg p-2">
								<User className="text-primary h-4 w-4" />
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Patient</p>
								<p className="text-foreground text-sm font-medium">{patient}</p>
							</div>
						</div>
					)}

					{act && (
						<div className="flex items-center gap-3">
							<div className="rounded-lg bg-[hsl(var(--accent))]/10 p-2">
								<ClipboardList className="h-4 w-4 text-[hsl(var(--accent))]" />
							</div>
							<div>
								<p className="text-muted-foreground text-xs">Acte réalisé</p>
								<p className="text-foreground text-sm font-medium">{act}</p>
							</div>
						</div>
					)}

					<div className="bg-green-500/10 rounded-lg p-3 text-center">
						<p className="text-xs font-medium text-green-600">
							Validé le {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
						</p>
					</div>
				</CardContent>
			</Card>

			<Button asChild className="w-full max-w-sm">
				<Link href="/dashboard">Retour au tableau de bord</Link>
			</Button>
		</div>
	);
}
