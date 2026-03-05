'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
	ArrowLeft,
	ArrowRight,
	Award,
	Building2,
	CheckCircle2,
	FileCheck,
	Loader2,
	MapPin,
	Phone,
	Search,
	Stethoscope,
	User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { associateActToProfessional, registerProfessional } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Speciality, type HealthcareAct, type Structure } from '@/lib/types';

type Step = 'complete' | 'info' | 'specialty' | 'structure';

const specialties = [
	{ id: Speciality.NURSE, label: 'Infirmier(ère)' },
	{ id: Speciality.DOCTOR, label: 'Médecin' },
];

interface ProfessionalOnboardingContentProps {
	initialStructures: Structure[];
	initialCareActs: HealthcareAct[];
}

export function ProfessionalOnboardingContent({
	initialStructures,
	initialCareActs,
}: ProfessionalOnboardingContentProps) {
	const router = useRouter();
	const { refetchUser } = useAuth();
	const [currentStep, setCurrentStep] = useState<Step>('structure');
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const structures = initialStructures;
	const careActs = initialCareActs;
	const [formData, setFormData] = useState({
		structureId: '',
		firstName: '',
		lastName: '',
		phone: '',
		specialty: '',
		licenseType: 'adeli' as 'adeli' | 'rpps',
		licenseNumber: '',
		selectedActs: [] as number[],
	});

	const steps = [
		{ id: 'structure', label: 'Structure', icon: Building2 },
		{ id: 'info', label: 'Identité', icon: User },
		{ id: 'specialty', label: 'Spécialité', icon: Stethoscope },
		{ id: 'complete', label: 'Terminé', icon: CheckCircle2 },
	];

	const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	const filteredStructures = structures.filter(
		(s) =>
			s.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			s.Address.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleNext = async () => {
		if (currentStep === 'structure' && !formData.structureId) {
			return;
		}
		if (currentStep === 'info' && (!formData.firstName || !formData.lastName)) {
			return;
		}
		if (currentStep === 'specialty' && (!formData.specialty || !formData.licenseNumber)) {
			return;
		}

		const stepOrder: Step[] = ['structure', 'info', 'specialty', 'complete'];
		const currentIndex = stepOrder.indexOf(currentStep);

		if (currentStep === 'specialty') {
			setIsLoading(true);
			try {
				await registerProfessional({
					speciality: formData.specialty,
					structureId: Number(formData.structureId),
					idn: formData.licenseNumber,
				});
				// Associate selected acts
				for (const actId of formData.selectedActs) {
					await associateActToProfessional(actId);
				}
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
		const stepOrder: Step[] = ['structure', 'info', 'specialty', 'complete'];
		const currentIndex = stepOrder.indexOf(currentStep);
		if (currentIndex > 0) {
			setCurrentStep(stepOrder[currentIndex - 1]);
		}
	};

	const handleComplete = () => {
		router.push('/dashboard');
	};

	const toggleAct = (actId: number) => {
		setFormData((previous) => ({
			...previous,
			selectedActs: previous.selectedActs.includes(actId)
				? previous.selectedActs.filter((id) => id !== actId)
				: [...previous.selectedActs, actId],
		}));
	};

	return (
		<div className="container mx-auto max-w-2xl px-4 py-8">
			{/* Progress Header */}
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

			{/* Step Content */}
			{currentStep === 'structure' && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="text-primary h-5 w-5" />
							Rejoignez une structure médicale
						</CardTitle>
						<CardDescription>Sélectionnez la structure dans laquelle vous exercez</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="relative">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder="Rechercher une structure..."
								value={searchQuery}
								onChange={(event_) => setSearchQuery(event_.target.value)}
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
							Vos informations professionnelles
						</CardTitle>
						<CardDescription>Renseignez vos coordonnées pour créer votre profil professionnel</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="lastName">Nom *</Label>
								<Input
									id="lastName"
									value={formData.lastName}
									onChange={(event_) => setFormData({ ...formData, lastName: event_.target.value })}
									placeholder="Laurent"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="firstName">Prénom *</Label>
								<Input
									id="firstName"
									value={formData.firstName}
									onChange={(event_) => setFormData({ ...formData, firstName: event_.target.value })}
									placeholder="Sophie"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Téléphone professionnel</Label>
							<div className="relative">
								<Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									id="phone"
									type="tel"
									value={formData.phone}
									onChange={(event_) => setFormData({ ...formData, phone: event_.target.value })}
									placeholder="06 45 67 89 01"
									className="pl-9"
								/>
							</div>
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

			{currentStep === 'specialty' && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Stethoscope className="text-primary h-5 w-5" />
							Spécialité et certification
						</CardTitle>
						<CardDescription>Renseignez votre spécialité et numéro d&apos;identification</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="specialty">Spécialité *</Label>
							<Select
								value={formData.specialty}
								onValueChange={(value) => value && setFormData({ ...formData, specialty: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Sélectionnez votre spécialité" />
								</SelectTrigger>
								<SelectContent>
									{specialties.map((specialty) => (
										<SelectItem key={specialty.id} value={specialty.id}>
											{specialty.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-4">
							<Label>Type de numéro d&apos;identification *</Label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setFormData({ ...formData, licenseType: 'adeli' })}
									className={`rounded-lg border p-4 text-left transition-all ${
										formData.licenseType === 'adeli'
											? 'border-primary bg-primary/5 ring-primary/20 ring-2'
											: 'border-border hover:border-primary/50'
									}`}
								>
									<div className="flex items-center gap-2">
										<Award className="text-primary h-5 w-5" />
										<div>
											<p className="text-foreground font-medium">ADELI</p>
											<p className="text-muted-foreground text-xs">Numéro ADELI</p>
										</div>
									</div>
								</button>
								<button
									type="button"
									onClick={() => setFormData({ ...formData, licenseType: 'rpps' })}
									className={`rounded-lg border p-4 text-left transition-all ${
										formData.licenseType === 'rpps'
											? 'border-primary bg-primary/5 ring-primary/20 ring-2'
											: 'border-border hover:border-primary/50'
									}`}
								>
									<div className="flex items-center gap-2">
										<FileCheck className="text-primary h-5 w-5" />
										<div>
											<p className="text-foreground font-medium">RPPS</p>
											<p className="text-muted-foreground text-xs">Répertoire partagé</p>
										</div>
									</div>
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="licenseNumber">Numéro {formData.licenseType === 'adeli' ? 'ADELI' : 'RPPS'} *</Label>
							<Input
								id="licenseNumber"
								value={formData.licenseNumber}
								onChange={(event_) => setFormData({ ...formData, licenseNumber: event_.target.value })}
								placeholder={formData.licenseType === 'adeli' ? '75 12345 6' : '10123456789'}
							/>
							<p className="text-muted-foreground text-xs">Ce numéro sera vérifié auprès des bases officielles</p>
						</div>

						<div className="space-y-3">
							<Label>Actes que vous pratiquez</Label>
							<div className="grid max-h-48 gap-2 overflow-y-auto pr-2">
								{careActs.map((act) => (
									<label
										key={act.Id}
										className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
											formData.selectedActs.includes(act.Id)
												? 'border-primary bg-primary/5'
												: 'border-border hover:bg-muted/50'
										}`}
									>
										<Checkbox
											checked={formData.selectedActs.includes(act.Id)}
											onCheckedChange={() => toggleAct(act.Id)}
										/>
										<div className="flex-1">
											<p className="text-foreground text-sm font-medium">{act.Name}</p>
											<p className="text-muted-foreground text-xs">{act.Description}</p>
										</div>
										<Badge variant="secondary" className="text-xs">
											{act.Price} €
										</Badge>
									</label>
								))}
							</div>
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" onClick={handleBack}>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Retour
							</Button>
							<Button onClick={handleNext} disabled={isLoading || !formData.specialty || !formData.licenseNumber}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Vérification...
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
						<p className="text-muted-foreground mx-auto mb-4 max-w-md">
							Votre compte professionnel est maintenant configuré.
						</p>
						<div className="bg-muted/50 mx-auto mb-8 max-w-sm rounded-lg p-4">
							<p className="text-foreground text-sm">
								<span className="font-medium">Numéro {formData.licenseType.toUpperCase()} vérifié</span>
							</p>
							<p className="text-muted-foreground mt-1 text-xs">Vous pouvez maintenant valider des actes de soins</p>
						</div>
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
