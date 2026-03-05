'use client';

import { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Application error:', error);
	}, [error]);

	return (
		<div className="bg-background flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
						<AlertTriangle className="text-destructive h-6 w-6" />
					</div>

					<CardTitle className="text-xl">Une erreur est survenue</CardTitle>
					<CardDescription>Un problème inattendu s&apos;est produit. Veuillez réessayer.</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-3">
					<Button onClick={reset} className="w-full">
						Réessayer
					</Button>

					<Button
						variant="outline"
						className="w-full"
						render={
							<a href="/dashboard" className="w-full">
								Retour au tableau de bord
							</a>
						}
						nativeButton={false}
					/>
					{error.digest && <p className="text-muted-foreground text-center text-xs">Code erreur : {error.digest}</p>}
				</CardContent>
			</Card>
		</div>
	);
}
