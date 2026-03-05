import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { Providers } from '@/components/providers';
import { auth0 } from '@/lib/auth0';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
	title: 'Proxicare - Gestion des soins médicaux',
	description:
		'Application de gestion des prescriptions, rendez-vous et actes médicaux pour patients et professionnels de santé',
};

export const viewport: Viewport = {
	themeColor: '#2563eb',
	width: 'device-width',
	initialScale: 1,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth0.getSession();

	return (
		<html lang="fr">
			<body className={`${inter.variable} font-sans antialiased`}>
				<Providers auth0User={session?.user}>{children}</Providers>
			</body>
		</html>
	);
}
