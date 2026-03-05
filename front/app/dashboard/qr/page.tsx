import { MobileQRPageContent } from '@/components/qr-validation/qr-mobile-page-content';
import { serverFetchAppointments } from '@/lib/server-api';
import { AppointmentStatus } from '@/lib/types';

export default async function MobileQRPage() {
	const appointments = await serverFetchAppointments();
	const today = new Date();
	const todayAppointments = appointments.filter(
		(appointment) =>
			new Date(appointment.AppointmentStartDate).toDateString() === today.toDateString() &&
			appointment.Status === AppointmentStatus.PLANNED,
	);

	return <MobileQRPageContent initialTodayAppointments={todayAppointments} />;
}
