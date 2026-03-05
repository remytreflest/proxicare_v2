import { AppointmentsPageContent } from '@/components/appointments/appointments-page-content';
import { serverFetchAppointments, serverFetchUser } from '@/lib/server-api';
import { getUserRole } from '@/lib/utils';

export default async function AppointmentsPage() {
	const [user, appointments] = await Promise.all([serverFetchUser(), serverFetchAppointments()]);
	const role = getUserRole(user);

	return <AppointmentsPageContent initialAppointments={appointments} user={user} role={role} />;
}
