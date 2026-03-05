import { auth0 } from '@/lib/auth0';

import type { Appointment, HealthcareAct, HealthcareProfessional, Prescription, Structure, User } from './types';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000/api';

async function getServerUserId(): Promise<string | null> {
	const session = await auth0.getSession();

	if (!session?.user.sub) {
		return null;
	}

	return session.user.sub.split('|')[1] ?? null;
}

async function serverFetch<T>(endpoint: string): Promise<T> {
	const userId = await getServerUserId();

	if (!userId) {
		throw new Error('Not authenticated');
	}

	const response = await fetch(`${API_BASE}${endpoint}`, {
		headers: {
			'Content-Type': 'application/json',
			'X-Userid': userId,
		},
		cache: 'no-store',
	});

	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

		throw new Error((body.message ?? body.error ?? `API error ${String(response.status)}`) as string);
	}

	return response.json() as Promise<T>;
}

export async function serverFetchUser(): Promise<User> {
	return serverFetch<User>('/user');
}

export async function serverTryFetchUser(): Promise<User | null> {
	try {
		return await serverFetch<User>('/user');
	} catch {
		return null;
	}
}

export async function serverFetchAppointments(): Promise<Appointment[]> {
	return serverFetch<Appointment[]>('/appointments').catch(() => []);
}

export async function serverFetchPatientPrescriptions(): Promise<Prescription[]> {
	return serverFetch<Prescription[]>('/prescriptions/patient').catch(() => []);
}

export async function serverFetchProfessionalPrescriptions(): Promise<Prescription[]> {
	return serverFetch<Prescription[]>('/prescriptions/healthcareprofessional').catch(() => []);
}

export async function serverFetchStructures(): Promise<Structure[]> {
	return serverFetch<Structure[]>('/structures').catch(() => []);
}

export async function serverFetchHealthcareActs(): Promise<HealthcareAct[]> {
	return serverFetch<HealthcareAct[]>('/healthcare/acts').catch(() => []);
}

export async function serverFetchUserActs(): Promise<HealthcareAct[]> {
	return serverFetch<HealthcareAct[]>('/healthcare/acts/user').catch(() => []);
}

export async function serverFetchHealthcareProfessionals(): Promise<HealthcareProfessional[]> {
	return serverFetch<HealthcareProfessional[]>('/healthcare/professionals').catch(() => []);
}
