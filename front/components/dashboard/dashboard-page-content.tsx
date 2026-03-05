'use client';

import { AdminDashboard } from '@/components/dashboard/admin-dashboard';
import { PatientDashboard } from '@/components/dashboard/patient-dashboard';
import { ProfessionalDashboard } from '@/components/dashboard/professional-dashboard';
import { StructureDashboard } from '@/components/dashboard/structure-dashboard';
import type { Appointment, Prescription, Structure, User, UserRole } from '@/lib/types';

interface DashboardPageContentProps {
	appointments: Appointment[];
	prescriptions: Prescription[];
	structures: Structure[];
	user: User | null;
	role: UserRole | null;
}

export function DashboardPageContent({ appointments, prescriptions, structures, role }: DashboardPageContentProps) {
	if (!role) {
		return null;
	}

	switch (role) {
		case 'patient': {
			return <PatientDashboard appointments={appointments} prescriptions={prescriptions} />;
		}

		case 'professional': {
			return <ProfessionalDashboard appointments={appointments} />;
		}

		case 'structure': {
			return <StructureDashboard appointments={appointments} prescriptions={prescriptions} />;
		}

		case 'admin': {
			return <AdminDashboard appointments={appointments} structures={structures} />;
		}

		default: {
			return <PatientDashboard appointments={appointments} prescriptions={prescriptions} />;
		}
	}
}
