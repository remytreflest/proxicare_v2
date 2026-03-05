'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export function RegisterForm() {
	const router = useRouter();
	const { user: auth0User } = useUser();
	const { needsRegistration, isLoading: authLoading, refetchUser } = useAuth();

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (auth0User) {
			setFirstName(auth0User.given_name ?? auth0User.nickname ?? '');
			setLastName(auth0User.family_name ?? '');
			setEmail(auth0User.email ?? '');
		}
	}, [auth0User]);

	useEffect(() => {
		if (!authLoading && !needsRegistration) {
			router.push('/onboarding');
		}
	}, [authLoading, needsRegistration, router]);

	const handleSubmit = async (event: React.SyntheticEvent) => {
		event.preventDefault();
		setError(null);

		if (!firstName.trim() || !lastName.trim() || !email.trim()) {
			setError('Tous les champs sont requis.');

			return;
		}

		setIsSubmitting(true);

		const result = await registerUser({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: email.trim(),
		});

		if (result.error) {
			setError(result.error.message);
			setIsSubmitting(false);

			return;
		}

		await refetchUser();
		router.push('/onboarding');
	};

	if (authLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto flex max-w-lg items-center justify-center px-4 py-16">
			<Card className="w-full shadow-xl">
				<CardHeader className="space-y-1 pb-6 text-center">
					<div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
						<UserPlus className="text-primary h-7 w-7" />
					</div>
					<CardTitle className="text-2xl font-bold">Créer votre compte</CardTitle>
					<CardDescription>
						Renseignez vos informations pour finaliser la création de votre compte Proxicare.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="firstName">Prénom</Label>
							<Input
								id="firstName"
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
								placeholder="Votre prénom"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Nom</Label>
							<Input
								id="lastName"
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
								placeholder="Votre nom"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="votre@email.com"
								required
							/>
						</div>

						{error && <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>}

						<Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Création en cours...
								</>
							) : (
								'Créer mon compte'
							)}
						</Button>

						<p className="text-muted-foreground text-center text-xs">
							En créant votre compte, vous acceptez les conditions d&apos;utilisation de Proxicare.
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
