'use client';

import React, { useState } from 'react';

import { Building2, Eye, EyeOff, Loader2, ShieldCheck, Stethoscope, User } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/lib/types';

interface LoginFormProps {
	onSubmit: (email: string, password: string, role: UserRole) => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
	{ value: 'patient', label: 'Patient', icon: User, description: 'Accédez à vos soins' },
	{ value: 'professional', label: 'Professionnel', icon: Stethoscope, description: 'Gérez vos patients' },
	{ value: 'structure', label: 'Structure', icon: Building2, description: 'Administrez votre établissement' },
	{ value: 'admin', label: 'Administrateur', icon: ShieldCheck, description: 'Administration système' },
];

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		await onSubmit(email, password, selectedRole);
	};

	return (
		<Card className="border-0 shadow-xl">
			<CardHeader className="space-y-1 pb-6">
				<CardTitle className="text-center text-2xl font-bold">Connexion</CardTitle>
				<CardDescription className="text-center">Entrez vos identifiants pour accéder à votre espace</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-3">
						<Label className="text-sm font-medium">Je suis un(e)</Label>
						<div className="grid grid-cols-2 gap-2">
							{roles.map((role) => (
								<button
									key={role.value}
									type="button"
									onClick={() => setSelectedRole(role.value)}
									className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200 ${
										selectedRole === role.value
											? 'border-primary bg-primary/5 text-primary'
											: 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
									} `}
								>
									<role.icon className="h-5 w-5" />
									<span className="text-sm font-medium">{role.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Adresse email</Label>
						<Input
							id="email"
							type="email"
							placeholder="exemple@email.com"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="h-11"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Mot de passe</Label>
							<Button variant="link" className="text-primary h-auto px-0 text-sm">
								Mot de passe oublié ?
							</Button>
						</div>

						<div className="relative">
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Entrez votre mot de passe"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								className="h-11 pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="h-11 w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Connexion en cours...
							</>
						) : (
							'Se connecter'
						)}
					</Button>

					<p className="text-muted-foreground text-center text-xs">
						Mode démo : utilisez n'importe quels identifiants pour vous connecter
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
