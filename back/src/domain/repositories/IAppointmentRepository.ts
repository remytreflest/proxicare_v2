import Appointment from '@/infrastructure/database/models/Appointment.model';

export interface IAppointmentRepository {
  findAllForUser(patientId?: number, professionalId?: number): Promise<Appointment[]>;
  findById(id: number): Promise<Appointment | null>;
  create(data: {
    PatientId: number;
    HealthcareProfessionalId: number;
    PrescriptionHealthcareActId: number;
    Status: string;
    AppointmentStartDate: string;
    AppointmentEndDate: string;
  }): Promise<Appointment>;
  delete(appointment: Appointment): Promise<void>;
}
