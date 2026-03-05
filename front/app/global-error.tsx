'use client';

import { useEffect } from 'react';

import { AlertTriangle } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Global error:', error);
	}, [error]);

	return (
		<html lang="fr">
			<body className="font-sans antialiased">
				<div
					style={{
						display: 'flex',
						minHeight: '100vh',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '1rem',
						fontFamily: 'system-ui, sans-serif',
					}}
				>
					<div style={{ textAlign: 'center', maxWidth: '24rem' }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								marginBottom: '1rem',
							}}
						>
							<AlertTriangle style={{ width: '3rem', height: '3rem', color: '#dc2626' }} />
						</div>

						<h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Erreur critique</h2>

						<p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
							L&apos;application a rencontré une erreur critique. Veuillez réessayer.
						</p>

						<button
							onClick={reset}
							type="button"
							style={{
								padding: '0.5rem 1.5rem',
								backgroundColor: '#2563eb',
								color: 'white',
								border: 'none',
								borderRadius: '0.375rem',
								cursor: 'pointer',
								fontSize: '0.875rem',
								fontWeight: 500,
							}}
						>
							Réessayer
						</button>

						{error.digest && (
							<p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '1rem' }}>Code erreur : {error.digest}</p>
						)}
					</div>
				</div>
			</body>
		</html>
	);
}
