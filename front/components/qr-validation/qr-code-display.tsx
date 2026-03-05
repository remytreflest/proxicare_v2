'use client';

import { useCallback, useEffect, useState } from 'react';

import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Loader2,
	QrCode,
	RefreshCw,
	Shield,
	Smartphone,
	Timer,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { fetchQRCode } from '@/lib/api';
import type { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
	appointments: Appointment[];
	selectedAppointmentId: string | null;
	onSelectAppointment: (id: string | null) => void;
}

type QRStatus = 'active' | 'error' | 'expired' | 'expiring' | 'loading' | 'validated';

const QR_VALIDITY_SECONDS = 15;

export function QRCodeDisplay({ appointments, selectedAppointmentId, onSelectAppointment }: QRCodeDisplayProps) {
	const [timeLeft, setTimeLeft] = useState(QR_VALIDITY_SECONDS);
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
	const [status, setStatus] = useState<QRStatus>('loading');

	const selectedAppointment = appointments.find((a) => String(a.Id) === selectedAppointmentId);

	useEffect(() => {
		if (!selectedAppointmentId && appointments.length > 0) {
			onSelectAppointment(String(appointments[0].Id));
		}
	}, [appointments, selectedAppointmentId, onSelectAppointment]);

	const loadQRCode = useCallback(async () => {
		if (!selectedAppointment) {
			return;
		}

		setStatus('loading');
		setQrCodeDataUrl('');

		try {
			const result = await fetchQRCode(selectedAppointment.PrescriptionHealthcareActId);

			setQrCodeDataUrl(result.qrCodeDataUrl);
			setTimeLeft(QR_VALIDITY_SECONDS);
			setStatus('active');
		} catch {
			setStatus('error');
		}
	}, [selectedAppointment]);

	useEffect(() => {
		if (selectedAppointment) {
			loadQRCode();
		}
	}, [selectedAppointmentId, loadQRCode]);

	useEffect(() => {
		if (status !== 'active' && status !== 'expiring') {
			return;
		}

		const interval = setInterval(() => {
			setTimeLeft((previous) => {
				if (previous <= 1) {
					setStatus('expired');

					return 0;
				}

				if (previous <= 5) {
					setStatus('expiring');
				}

				return previous - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [status]);

	const progress = (timeLeft / QR_VALIDITY_SECONDS) * 100;

	const getStatusConfig = () => {
		switch (status) {
			case 'loading': {
				return {
					borderColor: 'border-muted',
					bgColor: 'bg-muted/10',
					icon: Loader2,
					iconColor: 'text-muted-foreground',
					label: 'Chargement…',
					labelColor: 'text-muted-foreground',
				};
			}

			case 'active': {
				return {
					borderColor: 'border-primary/30',
					bgColor: 'bg-primary/5',
					icon: Shield,
					iconColor: 'text-primary',
					label: 'Code actif',
					labelColor: 'text-primary',
				};
			}

			case 'expiring': {
				return {
					borderColor: 'border-warning',
					bgColor: 'bg-warning/10',
					icon: Timer,
					iconColor: 'text-warning',
					label: 'Expiration imminente',
					labelColor: 'text-warning',
				};
			}

			case 'expired': {
				return {
					borderColor: 'border-destructive/50',
					bgColor: 'bg-destructive/5',
					icon: AlertTriangle,
					iconColor: 'text-destructive',
					label: 'Code expiré',
					labelColor: 'text-destructive',
				};
			}

			case 'validated': {
				return {
					borderColor: 'border-green-500',
					bgColor: 'bg-green-500/10',
					icon: CheckCircle2,
					iconColor: 'text-green-500',
					label: 'Validé',
					labelColor: 'text-green-500',
				};
			}

			default: {
				return {
					borderColor: 'border-destructive/50',
					bgColor: 'bg-destructive/5',
					icon: AlertTriangle,
					iconColor: 'text-destructive',
					label: 'Erreur',
					labelColor: 'text-destructive',
				};
			}
		}
	};

	const statusConfig = getStatusConfig();
	const StatusIcon = statusConfig.icon;

	if (appointments.length === 0) {
		return (
			<Card className="border-0 shadow-sm">
				<CardContent className="flex flex-col items-center justify-center px-4 py-12">
					<div className="bg-muted mb-6 rounded-full p-6">
						<QrCode className="text-muted-foreground/50 h-12 w-12" />
					</div>

					<h3 className="text-foreground mb-2 text-center text-lg font-semibold">Aucun soin à valider</h3>

					<p className="text-muted-foreground max-w-xs text-center text-sm">
						Vous n&apos;avez pas de rendez-vous prévu aujourd&apos;hui nécessitant une validation par QR code.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader className="pb-2 text-center">
				<div className="mb-1 flex items-center justify-center gap-2">
					<Smartphone className="text-primary h-5 w-5" />
					<CardTitle className="text-lg">QR Code de validation</CardTitle>
				</div>

				<CardDescription>Présentez ce code à votre professionnel de santé</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4 px-4 sm:px-6">
				{appointments.length > 1 && (
					<div className="flex flex-wrap justify-center gap-2">
						{appointments.map((appointment) => (
							<Button
								key={String(appointment.Id)}
								variant={selectedAppointmentId === String(appointment.Id) ? 'default' : 'outline'}
								size="sm"
								onClick={() => onSelectAppointment(String(appointment.Id))}
								className={cn('text-xs', selectedAppointmentId !== String(appointment.Id) && 'bg-transparent')}
							>
								{new Date(appointment.AppointmentStartDate).toLocaleTimeString('fr-FR', {
									hour: '2-digit',
									minute: '2-digit',
								})}
							</Button>
						))}
					</div>
				)}

				{selectedAppointment && (
					<div className="bg-muted/50 border-border rounded-xl border p-3 text-center">
						<p className="text-foreground text-sm font-medium">
							{selectedAppointment.PrescriptionHealthcareAct?.HealthcareAct?.Name ?? 'Acte'}
						</p>
						<p className="text-muted-foreground mt-0.5 text-xs">
							{selectedAppointment.HealthcareProfessional?.User
								? `${selectedAppointment.HealthcareProfessional.User.FirstName} ${selectedAppointment.HealthcareProfessional.User.LastName}`
								: 'Professionnel'}{' '}
							-{' '}
							{new Date(selectedAppointment.AppointmentStartDate).toLocaleTimeString('fr-FR', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</p>
					</div>
				)}

				<div
					className={cn(
						'mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all',
						statusConfig.bgColor,
					)}
				>
					<StatusIcon className={cn('h-4 w-4', statusConfig.iconColor, status === 'loading' && 'animate-spin')} />
					<span className={cn('text-sm font-medium', statusConfig.labelColor)}>{statusConfig.label}</span>
				</div>

				<div className="flex flex-col items-center">
					<div
						className={cn(
							'bg-card relative rounded-2xl border-2 p-4 shadow-lg transition-all sm:p-6',
							statusConfig.borderColor,
							status === 'expired' && 'opacity-50',
						)}
					>
						{status === 'expired' && (
							<div className="bg-background/90 absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl">
								<AlertTriangle className="text-destructive mb-3 h-10 w-10" />

								<p className="text-foreground text-sm font-semibold">Code expiré</p>

								<Button size="sm" className="mt-3" onClick={loadQRCode}>
									<RefreshCw className="mr-1.5 h-3 w-3" />
									Renouveler
								</Button>
							</div>
						)}

						{status === 'error' && (
							<div
								className="flex flex-col items-center justify-center"
								style={{ width: 'min(200px, 60vw)', height: 'min(200px, 60vw)' }}
							>
								<AlertTriangle className="text-destructive mb-3 h-10 w-10" />

								<p className="text-foreground text-center text-sm font-semibold">Impossible de générer le QR code</p>

								<Button size="sm" className="mt-3" onClick={loadQRCode}>
									<RefreshCw className="mr-1.5 h-3 w-3" />
									Réessayer
								</Button>
							</div>
						)}

						{status === 'loading' && (
							<div
								className="flex items-center justify-center"
								style={{ width: 'min(200px, 60vw)', height: 'min(200px, 60vw)' }}
							>
								<Loader2 className="text-primary h-10 w-10 animate-spin" />
							</div>
						)}

						{qrCodeDataUrl && status !== 'loading' && status !== 'error' && (
							<img src={qrCodeDataUrl} alt="QR Code" className="h-auto w-full" />
						)}
					</div>

					{(status === 'active' || status === 'expiring') && (
						<div className="mt-6 w-full max-w-55">
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="text-muted-foreground flex items-center gap-1.5">
									<Clock className="h-3.5 w-3.5" />
									Expiration dans
								</span>
								<span
									className={cn(
										'font-mono text-lg font-bold tabular-nums',
										status === 'expiring' ? 'text-warning animate-pulse' : 'text-foreground',
									)}
								>
									{timeLeft}s
								</span>
							</div>

							<div className="relative">
								<Progress
									value={progress}
									className={cn('h-2.5 rounded-full', status === 'expiring' && '[&>div]:bg-warning')}
								/>
							</div>
						</div>
					)}

					<div className="mt-5 flex gap-2">
						{(status === 'active' || status === 'expiring') && (
							<Button variant="outline" size="sm" className="gap-1.5 bg-transparent text-xs" onClick={loadQRCode}>
								<RefreshCw className="h-3.5 w-3.5" />
								Nouveau code
							</Button>
						)}
					</div>
				</div>

				<div className="bg-muted/30 text-muted-foreground flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs">
					<Shield className="h-3.5 w-3.5 shrink-0" />
					<span>Code unique et sécurisé - Validité {QR_VALIDITY_SECONDS} secondes</span>
				</div>
			</CardContent>
		</Card>
	);
}
