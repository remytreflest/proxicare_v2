import { DashboardPageContent } from '@/components/dashboard/dashboard-page-content';
import {
	serverFetchAppointments,
	serverFetchPatientPrescriptions,
	serverFetchProfessionalPrescriptions,
	serverFetchStructures,
	serverFetchUser,
} from '@/lib/server-api';
import type { Prescription } from '@/lib/types';
import { getUserRole } from '@/lib/utils';

export default async function DashboardPage() {
	const [user, appointments] = await Promise.all([serverFetchUser(), serverFetchAppointments()]);
	const role = getUserRole(user);

	let prescriptions: Prescription[] = [];

	if (role === 'patient') {
		prescriptions = await serverFetchPatientPrescriptions();
	} else if (role === 'structure') {
		prescriptions = await serverFetchProfessionalPrescriptions();
	}

	const structures = role === 'admin' ? await serverFetchStructures() : [];

	return (
		<DashboardPageContent
			appointments={appointments}
			prescriptions={prescriptions}
			structures={structures}
			user={user}
			role={role}
		/>
	);
}
