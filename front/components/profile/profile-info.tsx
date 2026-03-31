'use client';

import { AlertCircle, Building2, Calendar, CreditCard, Mail, MapPin, User as UserIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { User, UserRole } from '@/lib/types';

interface ProfileInfoProps {
	user: User;
	role: UserRole;
}

export function ProfileInfo({ user, role }: ProfileInfoProps) {
	const address = user.Patient?.Address ?? user.HealthcareProfessional?.Structure?.Address;

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<UserIcon className="text-primary h-5 w-5" />
								Informations personnelles
							</CardTitle>
							<CardDescription>Gérez vos informations de base</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">Prénom</Label>
							<p className="text-foreground py-2 text-sm">{user.FirstName}</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Nom</Label>
							<p className="text-foreground py-2 text-sm">{user.LastName}</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email" className="flex items-center gap-1">
							<Mail className="h-3.5 w-3.5" />
							Email
						</Label>
						<p className="text-foreground py-2 text-sm">{user.Email}</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address" className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" />
							Adresse
						</Label>
						<p className="text-foreground py-2 text-sm">{address ?? 'Non renseignée'}</p>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-6">
				{/* Account Info */}
				<Card className="border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<Calendar className="h-5 w-5 text-[hsl(var(--accent))]" />
							Informations du compte
						</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="flex items-center justify-between py-2">
							<span className="text-muted-foreground text-sm">Membre depuis</span>
							<span className="text-foreground text-sm font-medium">
								{user.CreatedAt
									? new Date(user.CreatedAt).toLocaleDateString('fr-FR', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})
									: '-'}
							</span>
						</div>

						<Separator />

						<div className="flex items-center justify-between py-2">
							<span className="text-muted-foreground text-sm">Identifiant</span>
							<span className="text-foreground font-mono text-sm">{user.Id}</span>
						</div>

						<Separator />

						<div className="flex items-center justify-between py-2">
							<span className="text-muted-foreground text-sm">Statut du compte</span>
							<span className="text-sm font-medium text-[hsl(var(--success))]">Actif</span>
						</div>
					</CardContent>
				</Card>

				{role === 'patient' && (
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<CreditCard className="h-5 w-5 text-[hsl(var(--warning))]" />
								Informations médicales
							</CardTitle>
						</CardHeader>

						<CardContent>
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Pour mettre à jour vos informations médicales (numéro de sécurité sociale, contact d'urgence),
									veuillez contacter votre structure de soins.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				)}

				{role === 'structure' && (
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Building2 className="h-5 w-5 text-[hsl(var(--warning))]" />
								Informations de la structure
							</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="flex items-center justify-between py-2">
								<span className="text-muted-foreground text-sm">Nom de la structure</span>
								<span className="text-foreground text-sm font-medium">
									{user.HealthcareProfessional?.Structure?.Name ?? '-'}
								</span>
							</div>

							<Separator />

							<div className="flex items-center justify-between py-2">
								<span className="text-muted-foreground text-sm">Adresse</span>
								<span className="text-foreground text-sm">
									{user.HealthcareProfessional?.Structure?.Address ?? '-'}
								</span>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
