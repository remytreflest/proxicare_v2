'use client';

import { LoginFeatures } from '@/components/auth/login-features';
import { LoginHeader } from '@/components/auth/login-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPageContent() {
	return (
		<div className="flex min-h-screen">
			<div className="bg-primary hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
				<LoginHeader />
				<LoginFeatures />
				<p className="text-primary-foreground/60 text-sm">© 2026 Proxicare. Tous droits réservés.</p>
			</div>

			<div className="bg-background flex w-full items-center justify-center p-8 lg:w-1/2">
				<div className="w-full max-w-md">
					<div className="mb-8 lg:hidden">
						<LoginHeader variant="dark" />
					</div>

					<Card className="border-0 shadow-xl">
						<CardHeader className="space-y-1 pb-6">
							<CardTitle className="text-center text-2xl font-bold">Connexion</CardTitle>
							<CardDescription className="text-center">
								Connectez-vous avec votre compte pour accéder à votre espace
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-6">
							<Button className="h-11 w-full" render={<a href="/auth/login">Se connecter</a>} nativeButton={false} />

							<p className="text-muted-foreground text-center text-xs">
								La connexion est gérée de manière sécurisée via Auth0
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
