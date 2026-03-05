'use client';

import { useState } from 'react';

import {
	AlertCircle,
	Building2,
	Calendar,
	Check,
	CreditCard,
	Loader2,
	Mail,
	MapPin,
	User as UserIcon,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { User, UserRole } from '@/lib/types';

interface ProfileInfoProps {
	user: User;
	role: UserRole;
}

export function ProfileInfo({ user, role }: ProfileInfoProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const address = user.Patient?.Address ?? user.HealthcareProfessional?.Structure?.Address ?? '';
	const [formData, setFormData] = useState({
		firstName: user.FirstName,
		lastName: user.LastName,
		email: user.Email,
		address,
	});

	const handleSave = async () => {
		setIsSaving(true);

		// FIXME: call profile update API when available
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsSaving(false);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setFormData({
			firstName: user.FirstName,
			lastName: user.LastName,
			email: user.Email,
			address,
		});
		setIsEditing(false);
	};

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

						{isEditing ? (
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={handleCancel} className="bg-transparent">
									Annuler
								</Button>

								<Button size="sm" onClick={handleSave} disabled={isSaving}>
									{isSaving ? (
										<>
											<Loader2 className="mr-1 h-4 w-4 animate-spin" />
											Enregistrement...
										</>
									) : (
										<>
											<Check className="mr-1 h-4 w-4" />
											Enregistrer
										</>
									)}
								</Button>
							</div>
						) : (
							<Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="bg-transparent">
								Modifier
							</Button>
						)}
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">Prénom</Label>

							{isEditing ? (
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(event_) => setFormData({ ...formData, firstName: event_.target.value })}
								/>
							) : (
								<p className="text-foreground py-2 text-sm">{formData.firstName}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Nom</Label>

							{isEditing ? (
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(event_) => setFormData({ ...formData, lastName: event_.target.value })}
								/>
							) : (
								<p className="text-foreground py-2 text-sm">{formData.lastName}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email" className="flex items-center gap-1">
							<Mail className="h-3.5 w-3.5" />
							Email
						</Label>

						{isEditing ? (
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(event_) => setFormData({ ...formData, email: event_.target.value })}
							/>
						) : (
							<p className="text-foreground py-2 text-sm">{formData.email}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="address" className="flex items-center gap-1">
							<MapPin className="h-3.5 w-3.5" />
							Adresse
						</Label>

						{isEditing ? (
							<Textarea
								id="address"
								value={formData.address}
								onChange={(event_) => setFormData({ ...formData, address: event_.target.value })}
								placeholder="Votre adresse complète"
								rows={2}
							/>
						) : (
							<p className="text-foreground py-2 text-sm">{formData.address || 'Non renseignée'}</p>
						)}
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
									: '—'}
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
									{user.HealthcareProfessional?.Structure?.Name ?? '—'}
								</span>
							</div>

							<Separator />

							<div className="flex items-center justify-between py-2">
								<span className="text-muted-foreground text-sm">Adresse</span>
								<span className="text-foreground text-sm">
									{user.HealthcareProfessional?.Structure?.Address ?? '—'}
								</span>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
