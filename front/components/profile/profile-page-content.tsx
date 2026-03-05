'use client';

import { History, Stethoscope, User } from 'lucide-react';

import { ProfessionalActs } from '@/components/profile/professional-acts';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileHistory } from '@/components/profile/profile-history';
import { ProfileInfo } from '@/components/profile/profile-info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Appointment, HealthcareAct, Prescription, UserRole, User as UserType } from '@/lib/types';

interface ProfilePageContentProps {
	initialAppointments: Appointment[];
	initialPrescriptions: Prescription[];
	initialAllActs: HealthcareAct[];
	initialUserActs: HealthcareAct[];
	user: UserType | null;
	role: UserRole | null;
}

export function ProfilePageContent({
	initialAppointments,
	initialPrescriptions,
	initialAllActs,
	initialUserActs,
	user,
	role,
}: ProfilePageContentProps) {
	if (!user || !role) {
		return null;
	}

	return (
		<div className="space-y-6">
			<ProfileHeader user={user} role={role} />

			<Tabs defaultValue="info" className="flex flex-col space-y-6">
				<TabsList className="bg-muted/50 p-1">
					<TabsTrigger value="info" className="data-[state=active]:bg-card gap-2">
						<User className="h-4 w-4" />
						<span className="hidden sm:inline">Informations</span>
					</TabsTrigger>

					<TabsTrigger value="history" className="data-[state=active]:bg-card gap-2">
						<History className="h-4 w-4" />
						<span className="hidden sm:inline">Historique</span>
					</TabsTrigger>

					{role === 'professional' && (
						<TabsTrigger value="acts" className="data-[state=active]:bg-card gap-2">
							<Stethoscope className="h-4 w-4" />
							<span className="hidden sm:inline">Mes actes</span>
						</TabsTrigger>
					)}
				</TabsList>

				<TabsContent value="info">
					<ProfileInfo user={user} role={role} />
				</TabsContent>

				<TabsContent value="history">
					<ProfileHistory
						userRole={role}
						initialAppointments={initialAppointments}
						initialPrescriptions={initialPrescriptions}
					/>
				</TabsContent>

				{role === 'professional' && (
					<TabsContent value="acts">
						<ProfessionalActs initialAllActs={initialAllActs} initialUserActs={initialUserActs} />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
