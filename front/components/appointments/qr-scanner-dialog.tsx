'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import jsQR from 'jsqr';
import { Camera, CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateQrCodeToken } from '@/lib/api';

type ScanStatus = 'scanning' | 'success' | 'error';

interface QRScannerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
}

export function QRScannerDialog({ open, onOpenChange, onSuccess }: QRScannerDialogProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const animFrameRef = useRef<number>(0);
	const processedRef = useRef(false);

	const [status, setStatus] = useState<ScanStatus>('scanning');
	const [message, setMessage] = useState('');

	const stopCamera = useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
		cancelAnimationFrame(animFrameRef.current);
	}, []);

	const handleQrData = useCallback(
		async (data: string) => {
			if (processedRef.current) return;
			processedRef.current = true;
			stopCamera();

			const match = data.match(/\/validate-act\/healthcareprofessional\/(\d+)\/([^/?#]+)/);
			if (!match) {
				setStatus('error');
				setMessage('QR code invalide.');
				return;
			}

			const [, idStr, token] = match;
			const result = await validateQrCodeToken(Number(idStr), token);

			if (result.error) {
				setStatus('error');
				setMessage(result.error.message);
			} else {
				setStatus('success');
				setMessage(`Soin validé${result.data?.patientName ? ` — ${result.data.patientName}` : ''}`);
				setTimeout(() => {
					onSuccess();
					onOpenChange(false);
				}, 2000);
			}
		},
		[stopCamera, onSuccess, onOpenChange],
	);

	const tick = useCallback(() => {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
			animFrameRef.current = requestAnimationFrame(tick);
			return;
		}
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const code = jsQR(imageData.data, imageData.width, imageData.height);
		if (code) {
			handleQrData(code.data);
		} else {
			animFrameRef.current = requestAnimationFrame(tick);
		}
	}, [handleQrData]);

	useEffect(() => {
		if (!open) {
			stopCamera();
			setStatus('scanning');
			setMessage('');
			processedRef.current = false;
			return;
		}

		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then((stream) => {
				streamRef.current = stream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					videoRef.current.play();
					animFrameRef.current = requestAnimationFrame(tick);
				}
			})
			.catch(() => {
				setStatus('error');
				setMessage("Impossible d'accéder à la caméra. Vérifiez les permissions.");
			});

		return () => stopCamera();
	}, [open, tick, stopCamera]);

	return (
		<Dialog
			open={open}
			onOpenChange={(o) => {
				if (!o) stopCamera();
				onOpenChange(o);
			}}
		>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Camera className="h-5 w-5" />
						Scanner le QR code du patient
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{status === 'scanning' && (
						<div className="relative overflow-hidden rounded-xl bg-black">
							<video ref={videoRef} className="w-full rounded-xl" playsInline muted />
							<canvas ref={canvasRef} className="hidden" />
							<div className="pointer-events-none absolute inset-4">
								<div className="border-primary absolute top-0 left-0 h-8 w-8 rounded-tl-lg border-t-2 border-l-2" />
								<div className="border-primary absolute top-0 right-0 h-8 w-8 rounded-tr-lg border-t-2 border-r-2" />
								<div className="border-primary absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-2 border-l-2" />
								<div className="border-primary absolute right-0 bottom-0 h-8 w-8 rounded-br-lg border-r-2 border-b-2" />
							</div>
						</div>
					)}

					{status === 'scanning' && (
						<p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
							<Loader2 className="h-4 w-4 animate-spin" />
							Pointez la caméra vers le QR code du patient
						</p>
					)}

					{status === 'success' && (
						<div className="flex flex-col items-center gap-3 py-8">
							<CheckCircle2 className="h-16 w-16 text-green-500" />
							<p className="text-center font-medium text-green-600">{message}</p>
						</div>
					)}

					{status === 'error' && (
						<div className="flex flex-col items-center gap-3 py-8">
							<XCircle className="text-destructive h-16 w-16" />
							<p className="text-destructive text-center font-medium">{message}</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
