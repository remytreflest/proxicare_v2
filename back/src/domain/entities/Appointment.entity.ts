export interface IAppointment {
  Id: number;
  PatientId: number;
  HealthcareProfessionalId: number;
  PrescriptionHealthcareActId: number;
  Status: string;
  AppointmentStartDate: Date;
  AppointmentEndDate: Date;
}
