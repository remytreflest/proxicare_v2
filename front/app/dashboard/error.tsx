'use client';

import { useEffect } from 'react';

import { AlertTriangle, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Dashboard error:', error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] items-center justify-center p-6">
			<div className="text-center">
				<div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
					<AlertTriangle className="text-destructive h-6 w-6" />
				</div>

				<h2 className="mb-2 text-lg font-semibold">Erreur de chargement</h2>

				<p className="text-muted-foreground mb-6 max-w-sm text-sm">
					Impossible de charger cette page. Veuillez réessayer.
				</p>

				<Button onClick={reset}>
					<RotateCcw className="mr-2 h-4 w-4" />
					Réessayer
				</Button>

				{error.digest && <p className="text-muted-foreground mt-4 text-xs">Code erreur : {error.digest}</p>}
			</div>
		</div>
	);
}
