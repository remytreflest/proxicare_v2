'use client';

import React, { useState } from 'react';

import { Camera, CheckCircle2, Keyboard, Loader2, Scan, XCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type ScanStatus = 'error' | 'idle' | 'scanning' | 'success';

export function QRCodeScanner() {
	const [status, setStatus] = useState<ScanStatus>('idle');
	const [manualCode, setManualCode] = useState('');
	const [showManualInput, setShowManualInput] = useState(false);
	const [message, setMessage] = useState('');

	const handleScan = () => {
		setStatus('scanning');
		setMessage('');

		setTimeout(() => {
			const randomBytes = new Uint32Array(1);

			crypto.getRandomValues(randomBytes);

			const success = randomBytes[0] / 0xff_ff_ff_ff > 0.3;

			if (success) {
				setStatus('success');
				setMessage('Acte validé avec succès ! Marie Dupont - Injection sous-cutanée');
			} else {
				setStatus('error');
				setMessage('Code invalide ou expiré. Demandez au patient de générer un nouveau code.');
			}

			setTimeout(() => {
				setStatus('idle');
				setMessage('');
			}, 5000);
		}, 2000);
	};

	const handleManualSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!manualCode.trim()) {
			return;
		}

		setStatus('scanning');
		setMessage('');

		setTimeout(() => {
			if (manualCode.length >= 10) {
				setStatus('success');
				setMessage('Acte validé avec succès ! Marie Dupont - Injection sous-cutanée');
			} else {
				setStatus('error');
				setMessage('Code invalide. Vérifiez le code et réessayez.');
			}

			setTimeout(() => {
				setStatus('idle');
				setMessage('');
				setManualCode('');
			}, 5000);
		}, 1500);
	};

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Scan className="h-5 w-5 text-[hsl(var(--accent))]" />
					Scanner le QR Code
				</CardTitle>
				<CardDescription>Scannez le code du patient pour valider l'acte de soin</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="relative">
					<div
						className={cn(
							'mx-auto flex aspect-square max-w-75 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300',
							status === 'idle' && 'border-border bg-muted/30',
							status === 'scanning' && 'border-primary bg-primary/5',
							status === 'success' && 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5',
							status === 'error' && 'border-destructive bg-destructive/5',
						)}
					>
						{status === 'idle' && (
							<>
								<Camera className="text-muted-foreground/50 mb-4 h-16 w-16" />
								<p className="text-muted-foreground px-4 text-center text-sm">
									Placez le QR code du patient dans le cadre
								</p>
							</>
						)}

						{status === 'scanning' && (
							<>
								<Loader2 className="text-primary mb-4 h-16 w-16 animate-spin" />
								<p className="text-primary text-sm font-medium">Lecture en cours...</p>
							</>
						)}

						{status === 'success' && (
							<>
								<CheckCircle2 className="mb-4 h-16 w-16 text-[hsl(var(--success))]" />
								<p className="text-sm font-medium text-[hsl(var(--success))]">Validation réussie</p>
							</>
						)}

						{status === 'error' && (
							<>
								<XCircle className="text-destructive mb-4 h-16 w-16" />
								<p className="text-destructive text-sm font-medium">Échec de validation</p>
							</>
						)}

						{/* Scanning animation overlay */}
						{status === 'scanning' && (
							<div className="pointer-events-none absolute inset-4">
								<div className="border-primary absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-2 border-l-2" />
								<div className="border-primary absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-2 border-r-2" />
								<div className="border-primary absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2" />
								<div className="border-primary absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-2 border-b-2" />
								<div className="bg-primary/50 absolute top-1/2 right-0 left-0 h-0.5 animate-pulse" />
							</div>
						)}
					</div>
				</div>

				{message && (
					<Alert
						variant={status === 'success' ? 'default' : 'destructive'}
						className={cn(
							status === 'success' &&
								'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]',
						)}
					>
						<AlertDescription className="flex items-center gap-2">
							{status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
							{message}
						</AlertDescription>
					</Alert>
				)}

				<Button className="w-full gap-2" size="lg" onClick={handleScan} disabled={status === 'scanning'}>
					{status === 'scanning' ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Lecture en cours...
						</>
					) : (
						<>
							<Camera className="h-4 w-4" />
							Activer le scanner
						</>
					)}
				</Button>

				<div className="text-center">
					<Button
						variant="link"
						className="text-muted-foreground text-sm"
						onClick={() => setShowManualInput(!showManualInput)}
					>
						<Keyboard className="mr-1 h-4 w-4" />
						{showManualInput ? 'Masquer la saisie manuelle' : 'Saisir le code manuellement'}
					</Button>
				</div>

				{showManualInput && (
					<form onSubmit={handleManualSubmit} className="space-y-3">
						<div className="space-y-2">
							<Label htmlFor="manual-code">Code de validation</Label>
							<Input
								id="manual-code"
								placeholder="Entrez le code affiché sur le patient"
								value={manualCode}
								onChange={(event) => setManualCode(event.target.value)}
								className="font-mono"
							/>
						</div>

						<Button
							type="submit"
							variant="outline"
							className="w-full bg-transparent"
							disabled={status === 'scanning' || !manualCode.trim()}
						>
							Valider manuellement
						</Button>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
