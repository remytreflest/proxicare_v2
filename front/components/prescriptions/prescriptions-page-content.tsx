'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { CreatePrescriptionDialog } from '@/components/prescriptions/create-prescription-dialog';
import { PrescriptionDetails } from '@/components/prescriptions/prescription-details';
import { PrescriptionFilters } from '@/components/prescriptions/prescription-filters';
import { PrescriptionList } from '@/components/prescriptions/prescription-list';
import { Button } from '@/components/ui/button';
import { fetchPatientPrescriptions, fetchProfessionalPrescriptions } from '@/lib/api';
import type { HealthcareAct, HealthcareProfessional, Prescription, User, UserRole } from '@/lib/types';
import { getPrescriptionStatus } from '@/lib/utils';

interface PrescriptionsPageContentProps {
	initialPrescriptions: Prescription[];
	initialHealthcareActs: HealthcareAct[];
	initialHealthcareProfessionals: HealthcareProfessional[];
	user: User | null;
	role: UserRole | null;
}

export function PrescriptionsPageContent({
	initialPrescriptions,
	initialHealthcareActs,
	initialHealthcareProfessionals,
	user,
	role,
}: PrescriptionsPageContentProps) {
	const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
	const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	if (!user || !role) {
		return null;
	}

	const filteredPrescriptions = prescriptions.filter((prescription) => {
		const status = getPrescriptionStatus(prescription);
		const matchesStatus = statusFilter === 'all' || status === statusFilter;
		const patientName = prescription.Patient?.User
			? `${prescription.Patient.User.FirstName} ${prescription.Patient.User.LastName}`
			: '';
		const actNames = prescription.PrescriptionHealthcareActs?.map((act) => act.HealthcareAct?.Name ?? '') ?? [];
		const matchesSearch =
			searchQuery === '' ||
			patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			actNames.some((actName) => actName.toLowerCase().includes(searchQuery.toLowerCase()));

		return matchesStatus && matchesSearch;
	});

	const canCreate = ['structure', 'admin', 'professional'].includes(role);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-muted-foreground">
						{role === 'patient' && 'Consultez vos prescriptions médicales'}
						{role === 'professional' && 'Prescriptions de vos patients'}
						{role !== 'patient' && role !== 'professional' && 'Gérez les prescriptions de votre établissement'}
					</p>
				</div>

				{canCreate && (
					<Button onClick={() => setIsCreateOpen(true)} className="gap-2">
						<Plus className="h-4 w-4" />
						Nouvelle prescription
					</Button>
				)}
			</div>

			<PrescriptionFilters
				statusFilter={statusFilter}
				onStatusChange={setStatusFilter}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<PrescriptionList
						prescriptions={filteredPrescriptions}
						selectedId={selectedPrescription ? String(selectedPrescription.Id) : undefined}
						onSelect={setSelectedPrescription}
					/>
				</div>

				<div className="lg:col-span-1">
					<PrescriptionDetails
						prescription={selectedPrescription}
						userRole={role}
						onPlanningDone={async () => {
							setPrescriptions(
								await (role === 'patient' ? fetchPatientPrescriptions() : fetchProfessionalPrescriptions()),
							);
						}}
					/>
				</div>
			</div>

			{canCreate && (
				<CreatePrescriptionDialog
					open={isCreateOpen}
					onOpenChange={setIsCreateOpen}
					initialActs={initialHealthcareActs}
					initialProfessionals={initialHealthcareProfessionals}
					onCreated={async () => {
						setPrescriptions(
							await (role === 'patient' ? fetchPatientPrescriptions() : fetchProfessionalPrescriptions()),
						);
					}}
				/>
			)}
		</div>
	);
}
