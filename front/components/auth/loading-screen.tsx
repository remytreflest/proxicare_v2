'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingScreenProps {
	message?: string;
	submessage?: string;
}

export function LoadingScreen({
	message = 'Chargement de votre profil...',
	submessage = 'Veuillez patienter',
}: LoadingScreenProps) {
	const [dots, setDots] = useState('');

	useEffect(() => {
		const interval = setInterval(() => {
			setDots((previous) => (previous.length >= 3 ? '' : previous + '.'));
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="from-primary/5 to-background flex min-h-screen flex-col items-center justify-center bg-linear-to-b">
			<div className="mb-8">
				<div className="bg-primary shadow-primary/25 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
					<span className="text-primary-foreground text-2xl font-bold">P</span>
				</div>
			</div>

			<div className="relative mb-6">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>

			<div className="text-center">
				<p className="text-foreground font-medium">
					{message}
					<span className="inline-block w-6 text-left">{dots}</span>
				</p>
				<p className="text-muted-foreground mt-1 text-sm">{submessage}</p>
			</div>

			<div className="mt-8 flex gap-1.5">
				{[0, 1, 2].map((index) => (
					<div
						key={index}
						className={cn(
							'bg-primary/30 h-2 w-2 rounded-full transition-all duration-300',
							dots.length > index && 'bg-primary scale-110',
						)}
					/>
				))}
			</div>
		</div>
	);
}

export function InlineLoader({ message = 'Chargement...' }: { message?: string }) {
	return (
		<div className="flex items-center justify-center gap-2 py-8">
			<Loader2 className="text-primary h-5 w-5 animate-spin" />
			<span className="text-muted-foreground text-sm">{message}</span>
		</div>
	);
}
