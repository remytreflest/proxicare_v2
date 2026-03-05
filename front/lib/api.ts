import type { Appointment, Prescription, User } from './types';

export interface ApiError {
	status: number;
	message: string;
}

export interface ApiResponse<T> {
	data: T | null;
	error: ApiError | null;
}

let storedUserId: string | null = null;

export function setApiUserId(userId: string | null) {
	storedUserId = userId;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(options?.headers as Record<string, string>),
		};

		if (storedUserId) {
			headers['X-Userid'] = storedUserId;
		}

		const response = await fetch(`/backend${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

			return {
				data: null,
				error: {
					status: response.status,
					message: (body.message ?? body.error ?? `Erreur ${String(response.status)}`) as string,
				},
			};
		}

		const data = (await response.json()) as T;

		return { data, error: null };
	} catch {
		return {
			data: null,
			error: { status: 0, message: 'Erreur de connexion. Vérifiez votre connexion internet.' },
		};
	}
}

async function apiFetchData<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const result = await apiFetch<T>(endpoint, options);

	if (result.error || result.data === null) {
		throw new Error(result.error?.message ?? 'Unknown error');
	}

	return result.data;
}

export function fetchUser() {
	return apiFetch<User>('/user');
}

export function registerUser(body: { firstName: string; lastName: string; email: string }) {
	return apiFetch<User>('/register/user', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function registerPatient(body: {
	birthday: string;
	gender: string;
	address: string;
	socialSecurityNumber: string;
	structureId: number;
}) {
	return apiFetchData<{ message: string; patient: unknown }>('/register/patient', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function registerProfessional(body: { speciality: string; structureId: number; idn: string }) {
	return apiFetchData<{ message: string; patient: unknown }>('/register/healthcareprofessional', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function deleteAppointment(id: number) {
	return apiFetchData<{ message: string }>(`/appointment/${String(id)}`, {
		method: 'DELETE',
	});
}

export function createAppointment(body: {
	patientId: number;
	prescriptionHealthcareActId: number;
	appointmentStartDate: string;
	appointmentEndDate: string;
}) {
	return apiFetch<Appointment>('/appointment', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function associateActToProfessional(healthcareActId: number) {
	return apiFetchData<{ message: string }>('/healthcare/act/healthcareprofessional', {
		method: 'POST',
		body: JSON.stringify({ healthcareActId }),
	});
}

export function dissociateActFromProfessional(actId: number) {
	return apiFetchData<{ message: string }>(`/healthcare/act/healthcareprofessional/${String(actId)}`, {
		method: 'DELETE',
	});
}

export function createPrescription(body: {
	socialSecurityNumber: string;
	healthcareProfessionalId: number;
	startDate: string;
	endDate: string;
	acts: { id: number; occurrencesPerDay: number }[];
}) {
	return apiFetchData<{ message: string }>('/prescriptions', {
		method: 'POST',
		body: JSON.stringify(body),
	});
}

export function fetchPatientPrescriptions() {
	return apiFetchData<Prescription[]>('/prescriptions/patient').catch(() => []);
}

export function fetchProfessionalPrescriptions() {
	return apiFetchData<Prescription[]>('/prescriptions/healthcareprofessional').catch(() => []);
}

export function fetchAppointments() {
	return apiFetchData<Appointment[]>('/appointments').catch(() => []);
}

export function fetchQRCode(prescriptionHealthcareActId: number) {
	return apiFetchData<{ qrCodeDataUrl: string; validationUrl: string }>(
		`/qrcode/patient/${String(prescriptionHealthcareActId)}`,
	);
}
