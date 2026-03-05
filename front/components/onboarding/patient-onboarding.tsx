'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Calendar,
	CheckCircle2,
	FileText,
	Loader2,
	MapPin,
	Phone,
	Search,
	User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { registerPatient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Structure } from '@/lib/types';

type Step = 'complete' | 'info' | 'medical' | 'structure';

interface PatientOnboardingContentProps {
	initialStructures: Structure[];
}

export function PatientOnboardingContent({ initialStructures }: PatientOnboardingContentProps) {
	const router = useRouter();
	const { refetchUser } = useAuth();
	const [currentStep, setCurrentStep] = useState<Step>('structure');
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const structures = initialStructures;
	const [formData, setFormData] = useState({
		structureId: '',
		firstName: '',
		lastName: '',
		dateOfBirth: '',
		phone: '',
		address: '',
		socialSecurityNumber: '',
		emergencyContact: '',
		medicalHistory: '',
		allergies: '',
		gender: 'M',
	});

	const steps = [
		{ id: 'structure', label: 'Structure', icon: Building2 },
		{ id: 'info', label: 'Informations', icon: User },
		{ id: 'medical', label: 'Dossier médical', icon: FileText },
		{ id: 'complete', label: 'Terminé', icon: CheckCircle2 },
	];

	const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	const filteredStructures = structures.filter(
		(structure) =>
			structure.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			structure.Address.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleNext = async () => {
		if (currentStep === 'structure' && !formData.structureId) {
			return;
		}

		if (currentStep === 'info' && (!formData.firstName || !formData.lastName)) {
			return;
		}

		const stepOrder: Step[] = ['structure', 'info', 'medical', 'complete'];
		const currentIndex = stepOrder.indexOf(currentStep);

		if (currentStep === 'medical') {
			setIsLoading(true);

			try {
				await registerPatient({
					birthday: formData.dateOfBirth,
					gender: formData.gender,
					address: formData.address,
					socialSecurityNumber: formData.socialSecurityNumber,
					structureId: Number(formData.structureId),
				});
				await refetchUser();
			} catch (error) {
				alert(error instanceof Error ? error.message : "Erreur lors de l'inscription");
				setIsLoading(false);

				return;
			}

			setIsLoading(false);
		}

		if (currentIndex < stepOrder.length - 1) {
			setCurrentStep(stepOrder[currentIndex + 1]);
		}
	};

	const handleBack = () => {
		const stepOrder: Step[] = ['structure', 'info', 'medical', 'complete'];
		const currentIndex = stepOrder.indexOf(currentStep);

		if (currentIndex > 0) {
			setCurrentStep(stepOrder[currentIndex - 1]);
		}
	};

	const handleComplete = () => {
		router.push('/dashboard');
	};

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			<div className="mb-8">
				<div className="mb-4 flex items-center justify-between">
					{steps.map((step, index) => {
						const Icon = step.icon;
						const isActive = step.id === currentStep;
						const isCompleted = currentStepIndex > index;

						let stepColorClass = 'bg-muted text-muted-foreground';

						if (isActive) {
							stepColorClass = 'bg-primary text-primary-foreground';
						} else if (isCompleted) {
							stepColorClass = 'bg-primary/20 text-primary';
						}

						return (
							<div key={step.id} className="flex items-center">
								<div
									className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${stepColorClass}`}
								>
									<Icon className="h-5 w-5" />
								</div>

								{index < steps.length - 1 && (
									<div
										className={`mx-2 hidden h-1 w-12 rounded sm:block md:w-20 ${
											isCompleted ? 'bg-primary' : 'bg-muted'
										}`}
									/>
								)}
							</div>
						);
					})}
				</div>

				<Progress value={progress} className="h-2" />

				<p className="text-muted-foreground mt-2 text-center text-sm">
					Étape {currentStepIndex + 1} sur {steps.length}
				</p>
			</div>

			{currentStep === 'structure' && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="text-primary h-5 w-5" />
							Choisissez votre structure médicale
						</CardTitle>
						<CardDescription>
							Sélectionnez la structure de soins qui vous accompagnera dans votre parcours
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="relative">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

							<Input
								placeholder="Rechercher une structure..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className="pl-9"
							/>
						</div>

						<div className="grid max-h-80 gap-3 overflow-y-auto">
							{filteredStructures.map((structure) => (
								<button
									type="button"
									key={structure.Id}
									onClick={() => setFormData({ ...formData, structureId: String(structure.Id) })}
									className={`rounded-lg border p-4 text-left transition-all ${
										formData.structureId === String(structure.Id)
											? 'border-primary bg-primary/5 ring-primary/20 ring-2'
											: 'border-border hover:border-primary/50 hover:bg-muted/50'
									}`}
								>
									<div className="flex items-start justify-between">
										<div>
											<h4 className="text-foreground font-medium">{structure.Name}</h4>

											<div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
												<MapPin className="h-3 w-3" />
												{structure.Address || 'Adresse non renseignée'}
											</div>
										</div>

										{formData.structureId === String(structure.Id) && (
											<Badge variant="default" className="bg-primary">
												Sélectionnée
											</Badge>
										)}
									</div>
								</button>
							))}
						</div>

						<div className="flex justify-end pt-4">
							<Button onClick={handleNext} disabled={!formData.structureId}>
								Continuer
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{currentStep === 'info' && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="text-primary h-5 w-5" />
							Vos informations personnelles
						</CardTitle>
						<CardDescription>Ces informations sont nécessaires pour créer votre dossier patient</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="lastName">Nom *</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
									placeholder="Dupont"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="firstName">Prénom *</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
									placeholder="Marie"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="dateOfBirth">Date de naissance</Label>

							<div className="relative">
								<Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="dateOfBirth"
									type="date"
									value={formData.dateOfBirth}
									onChange={(event) => setFormData({ ...formData, dateOfBirth: event.target.value })}
									className="pl-9"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Téléphone</Label>

							<div className="relative">
								<Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
									placeholder="06 12 34 56 78"
									className="pl-9"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="address">Adresse</Label>

							<div className="relative">
								<MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
								<Textarea
									id="address"
									value={formData.address}
									onChange={(event) => setFormData({ ...formData, address: event.target.value })}
									placeholder="12 rue de la Santé, 75014 Paris"
									className="min-h-20 pl-9"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale</Label>
							<Input
								id="socialSecurityNumber"
								value={formData.socialSecurityNumber}
								onChange={(event) => setFormData({ ...formData, socialSecurityNumber: event.target.value })}
								placeholder="1 85 12 75 123 456 78"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="emergencyContact">Contact d&apos;urgence</Label>
							<Input
								id="emergencyContact"
								value={formData.emergencyContact}
								onChange={(event) => setFormData({ ...formData, emergencyContact: event.target.value })}
								placeholder="Jean Dupont - 06 98 76 54 32"
							/>
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Button>

							<Button onClick={handleNext} disabled={!formData.firstName || !formData.lastName}>
								Continuer
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{currentStep === 'medical' && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="text-primary h-5 w-5" />
							Dossier médical
						</CardTitle>
						<CardDescription>
							Ces informations aideront vos soignants à mieux vous accompagner (facultatif)
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="allergies">Allergies connues</Label>
							<Textarea
								id="allergies"
								value={formData.allergies}
								onChange={(event) => setFormData({ ...formData, allergies: event.target.value })}
								placeholder="Listez vos allergies médicamenteuses ou alimentaires..."
								className="min-h-24"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="medicalHistory">Antécédents médicaux</Label>
							<Textarea
								id="medicalHistory"
								value={formData.medicalHistory}
								onChange={(event) => setFormData({ ...formData, medicalHistory: event.target.value })}
								placeholder="Décrivez vos antécédents médicaux importants..."
								className="min-h-32"
							/>
						</div>

						<div className="bg-muted/50 text-muted-foreground rounded-lg p-4 text-sm">
							<p className="flex items-start gap-2">
								<FileText className="mt-0.5 h-4 w-4 shrink-0" />
								Ces informations sont confidentielles et sécurisées. Vous pourrez les modifier à tout moment depuis
								votre profil.
							</p>
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Button>

							<Button onClick={handleNext} disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Enregistrement...
									</>
								) : (
									<>
										Terminer
										<ArrowRight className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{currentStep === 'complete' && (
				<Card>
					<CardContent className="py-12 text-center">
						<div className="bg-primary/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
							<CheckCircle2 className="text-primary h-8 w-8" />
						</div>

						<h2 className="text-foreground mb-2 text-2xl font-semibold">Bienvenue sur Proxicare !</h2>

						<p className="text-muted-foreground mx-auto mb-8 max-w-md">
							Votre compte patient est maintenant configuré. Vous pouvez accéder à votre tableau de bord pour consulter
							vos prescriptions et rendez-vous.
						</p>

						<Button size="lg" onClick={handleComplete}>
							Accéder au tableau de bord
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
