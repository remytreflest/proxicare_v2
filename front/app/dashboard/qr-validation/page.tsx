import { QRValidationPageContent } from '@/components/qr-validation/qr-validation-page-content';
import { serverFetchAppointments, serverFetchUser } from '@/lib/server-api';
import { AppointmentStatus } from '@/lib/types';
import { getUserRole } from '@/lib/utils';

export default async function QRValidationPage() {
	const [user, appointments] = await Promise.all([serverFetchUser(), serverFetchAppointments()]);
	const role = getUserRole(user);
	const todayAppointments = appointments.filter(
		(appointment) =>
			new Date(appointment.AppointmentStartDate).toDateString() === new Date().toDateString() &&
			appointment.Status === AppointmentStatus.PLANNED,
	);

	return <QRValidationPageContent initialTodayAppointments={todayAppointments} user={user} role={role} />;
}
