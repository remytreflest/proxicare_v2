'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RolesEnum } from '@/lib/types';

export function RoleSelection() {
	const router = useRouter();
	const [selectedRole, setSelectedRole] = useState<RolesEnum | null>(null);

	const handleRoleSelect = (role: RolesEnum) => {
		setSelectedRole(role);
	};

	const handleContinue = () => {
		if (selectedRole === RolesEnum.PATIENT) {
			router.push('/onboarding/patient');
		} else if (selectedRole === RolesEnum.HEALTHCAREPROFESSIONAL) {
			router.push('/onboarding/professional');
		}
	};

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-bold">Bienvenue sur Proxicare</h1>
				<p className="text-muted-foreground">Choisissez votre rôle pour continuer</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card
					className={`cursor-pointer transition-all ${selectedRole === RolesEnum.PATIENT ? 'ring-primary ring-2' : ''}`}
					onClick={() => handleRoleSelect(RolesEnum.PATIENT)}
				>
					<CardHeader>
						<CardTitle>Patient</CardTitle>
						<CardDescription>Accédez à vos soins et rendez-vous</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Gérez vos prescriptions, consultez vos rendez-vous et communiquez avec vos soignants.
						</p>
					</CardContent>
				</Card>

				<Card
					className={`cursor-pointer transition-all ${
						selectedRole === RolesEnum.HEALTHCAREPROFESSIONAL ? 'ring-primary ring-2' : ''
					}`}
					onClick={() => handleRoleSelect(RolesEnum.HEALTHCAREPROFESSIONAL)}
				>
					<CardHeader>
						<CardTitle>Professionnel de santé</CardTitle>
						<CardDescription>Gérez vos patients et actes médicaux</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">
							Suivez vos patients, validez les actes médicaux et gérez vos prescriptions.
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="mt-8 text-center">
				<Button onClick={handleContinue} disabled={!selectedRole}>
					Continuer
				</Button>
			</div>
		</div>
	);
}
