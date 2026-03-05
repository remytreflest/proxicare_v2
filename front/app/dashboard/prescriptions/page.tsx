import { PrescriptionsPageContent } from '@/components/prescriptions/prescriptions-page-content';
import {
	serverFetchHealthcareActs,
	serverFetchHealthcareProfessionals,
	serverFetchPatientPrescriptions,
	serverFetchProfessionalPrescriptions,
	serverFetchUser,
} from '@/lib/server-api';
import type { HealthcareAct, HealthcareProfessional, Prescription } from '@/lib/types';
import { getUserRole } from '@/lib/utils';

export default async function PrescriptionsPage() {
	const user = await serverFetchUser();
	const role = getUserRole(user);

	let prescriptions: Prescription[] = [];
	let healthcareActs: HealthcareAct[] = [];
	let healthcareProfessionals: HealthcareProfessional[] = [];

	if (role === 'patient') {
		prescriptions = await serverFetchPatientPrescriptions();
	} else {
		[prescriptions, healthcareActs, healthcareProfessionals] = await Promise.all([
			serverFetchProfessionalPrescriptions(),
			serverFetchHealthcareActs(),
			serverFetchHealthcareProfessionals(),
		]);
	}

	return (
		<PrescriptionsPageContent
			initialPrescriptions={prescriptions}
			initialHealthcareActs={healthcareActs}
			initialHealthcareProfessionals={healthcareProfessionals}
			user={user}
			role={role}
		/>
	);
}
