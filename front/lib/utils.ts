import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PrescriptionHealthcareActStatus, RolesEnum, type Prescription, type User, type UserRole } from './types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function hasRole(user: User, role: RolesEnum): boolean {
	return user.Roles.split(',').includes(role);
}

export function getUserRole(user: User): UserRole {
	if (hasRole(user, RolesEnum.ADMIN)) {
		return 'admin';
	}

	if (hasRole(user, RolesEnum.STRUCTURE)) {
		return 'structure';
	}

	if (hasRole(user, RolesEnum.HEALTHCAREPROFESSIONAL) || hasRole(user, RolesEnum.DOCTOR)) {
		return 'professional';
	}

	return 'patient';
}

export function getUserDisplayName(user: User): string {
	return `${user.FirstName} ${user.LastName}`;
}

export function getUserInitials(user: User): string {
	return `${user.FirstName.charAt(0)}${user.LastName.charAt(0)}`.toUpperCase();
}

export function getPrescriptionStatus(prescription: Prescription): 'active' | 'completed' | 'expired' {
	const now = new Date();
	const end = new Date(prescription.EndDate);

	if (end < now) {
		const allPerformed = prescription.PrescriptionHealthcareActs?.every(
			(act) => act.Status === PrescriptionHealthcareActStatus.PERFORMED,
		);

		return allPerformed ? 'completed' : 'expired';
	}

	return 'active';
}
