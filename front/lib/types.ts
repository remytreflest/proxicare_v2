export enum RolesEnum {
	ADMIN = 'ADMIN',
	USER = 'USER',
	PATIENT = 'PATIENT',
	HEALTHCAREPROFESSIONAL = 'HEALTHCAREPROFESSIONAL',
	STRUCTURE = 'STRUCTURE',
	DOCTOR = 'DOCTOR',
}

export enum AppointmentStatus {
	CANCELLED = 'CANCELLED',
	PLANNED = 'PLANNED',
	PERFORMED = 'PERFORMED',
}

export enum PrescriptionHealthcareActStatus {
	TO_BE_PLANNED = 'TO_BE_PLANNED',
	CANCELLED = 'CANCELLED',
	PLANNED = 'PLANNED',
	PERFORMED = 'PERFORMED',
}

export enum Speciality {
	NURSE = 'NURSE',
	DOCTOR = 'DOCTOR',
}

export interface User {
	Id: string;
	FirstName: string;
	LastName: string;
	Email: string;
	Roles: string;
	CreatedAt: string;
	UpdatedAt?: string;
	Patient?: Patient;
	HealthcareProfessional?: HealthcareProfessional;
}

export interface Patient {
	Id: number;
	UserId: string;
	Birthday: string;
	Gender: string;
	Address: string;
	SocialSecurityNumber: string;
	StructureId: number;
	CreatedAt?: string;
	UpdatedAt?: string;
	Structure?: Structure;
	User?: User;
}

export interface HealthcareProfessional {
	Id: number;
	UserId: string;
	Speciality: Speciality | null;
	StructureId: number | null;
	IDN: string | null;
	CreatedAt?: string;
	UpdatedAt?: string;
	HealthcareActs?: HealthcareAct[];
	Structures?: Structure[];
	Structure?: Structure;
	User?: User;
}

export interface HealthcareAct {
	Id: number;
	Name: string;
	Description: string;
	Price: number;
	CreatedAt?: string;
	UpdatedAt?: string;
}

export interface Structure {
	Id: number;
	Name: string;
	Address: string;
	CreatedAt?: string;
	UpdatedAt?: string;
}

export interface Prescription {
	Id: number;
	SocialSecurityNumber: string;
	HealthcareProfessionalId: number | null;
	StartDate: string;
	EndDate: string;
	CreatedAt?: string;
	UpdatedAt?: string;
	Patient?: Patient;
	HealthcareProfessional?: HealthcareProfessional;
	PrescriptionHealthcareActs?: PrescriptionHealthcareAct[];
}

export interface PrescriptionHealthcareAct {
	Id: number;
	PrescriptionId: number;
	HealthcareActId: number;
	OccurrencesPerDay: number;
	Status: PrescriptionHealthcareActStatus;
	ValidateToken: string | null;
	ValidateTokenLimitTime: string | null;
	CreatedAt?: string;
	UpdatedAt?: string;
	HealthcareAct?: HealthcareAct;
	Appointments?: Appointment[];
	Prescription?: Prescription;
}

export interface Appointment {
	Id: number;
	PatientId: number;
	HealthcareProfessionalId: number;
	PrescriptionHealthcareActId: number;
	Status: AppointmentStatus;
	AppointmentStartDate: string;
	AppointmentEndDate: string;
	CreatedAt?: string;
	UpdatedAt?: string;
	Patient?: Patient;
	HealthcareProfessional?: HealthcareProfessional;
	PrescriptionHealthcareAct?: PrescriptionHealthcareAct;
}

export type UserRole = 'admin' | 'patient' | 'professional' | 'structure';
