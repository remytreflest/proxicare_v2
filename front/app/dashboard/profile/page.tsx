import { ProfilePageContent } from '@/components/profile/profile-page-content';
import {
	serverFetchAppointments,
	serverFetchHealthcareActs,
	serverFetchPatientPrescriptions,
	serverFetchProfessionalPrescriptions,
	serverFetchUser,
	serverFetchUserActs,
} from '@/lib/server-api';
import { getUserRole } from '@/lib/utils';

export default async function ProfilePage() {
	const [user, appointments] = await Promise.all([serverFetchUser(), serverFetchAppointments()]);
	const role = getUserRole(user);

	const prescriptions =
		role === 'patient' ? await serverFetchPatientPrescriptions() : await serverFetchProfessionalPrescriptions();
	const allActs = role === 'professional' ? await serverFetchHealthcareActs() : [];
	const userActs = role === 'professional' ? await serverFetchUserActs() : [];

	return (
		<ProfilePageContent
			initialAppointments={appointments}
			initialPrescriptions={prescriptions}
			initialAllActs={allActs}
			initialUserActs={userActs}
			user={user}
			role={role}
		/>
	);
}
