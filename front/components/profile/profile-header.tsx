'use client';

import { Camera, Mail, MapPin } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { User, UserRole } from '@/lib/types';
import { getUserInitials } from '@/lib/utils';

interface ProfileHeaderProps {
	user: User;
	role: UserRole;
}

const roleLabels: Record<UserRole, string> = {
	patient: 'Patient',
	professional: 'Professionnel de santé',
	structure: 'Structure médicale',
	admin: 'Administrateur',
};

const roleColors: Record<UserRole, string> = {
	patient: 'bg-primary/10 text-primary',
	professional: 'bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]',
	structure: 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]',
	admin: 'bg-destructive/10 text-destructive',
};

export function ProfileHeader({ user, role }: ProfileHeaderProps) {
	const address = user.Patient?.Address;

	return (
		<Card className="overflow-hidden border-0 shadow-sm">
			<div className="from-primary via-primary/80 h-24 bg-linear-to-r to-[hsl(var(--accent))] sm:h-32" />

			<CardContent className="relative pb-6">
				<div className="absolute -top-12 left-6 sm:-top-16">
					<div className="relative">
						<Avatar className="border-card h-24 w-24 border-4 shadow-lg sm:h-32 sm:w-32">
							<AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
								{getUserInitials(user)}
							</AvatarFallback>
						</Avatar>

						<Button
							size="icon"
							variant="secondary"
							className="absolute right-0 bottom-0 h-8 w-8 rounded-full shadow-md"
						>
							<Camera className="h-4 w-4" />
							<span className="sr-only">Changer la photo</span>
						</Button>
					</div>
				</div>

				<div className="pt-14 sm:pt-20 sm:pl-40">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<div className="mb-1 flex items-center gap-3">
								<h1 className="text-foreground text-2xl font-bold">
									{user.FirstName} {user.LastName}
								</h1>

								<Badge variant="secondary" className={roleColors[role]}>
									{roleLabels[role]}
								</Badge>
							</div>

							<div className="text-muted-foreground mt-3 flex flex-wrap gap-4 text-sm">
								<span className="flex items-center gap-1.5">
									<Mail className="h-4 w-4" />
									{user.Email}
								</span>

								{address && (
									<span className="flex items-center gap-1.5">
										<MapPin className="h-4 w-4" />
										{address}
									</span>
								)}
							</div>
						</div>

						<Button className="sm:self-start">Modifier le profil</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
