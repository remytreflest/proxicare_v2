import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';
import { IHealthcareProfessionalHealthcareActRepository } from '@/domain/repositories/IHealthcareProfessionalHealthcareActRepository';
import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';
import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import { AppointmentsStatusEnum } from '@/shared/enums/appointment-status.enum';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';
import Appointment from '@/infrastructure/database/models/Appointment.model';

export class CreateAppointment {
  constructor(
    private readonly patientRepo: IPatientRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly actRepo: IHealthcareActRepository,
    private readonly linkRepo: IHealthcareProfessionalHealthcareActRepository,
    private readonly prescriptionActRepo: IPrescriptionHealthcareActRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(data: {
    userId: string;
    patientId: number;
    prescriptionHealthcareActId: number;
    appointmentStartDate: string;
    appointmentEndDate: string;
  }): Promise<Appointment> {
    const startDate = new Date(data.appointmentStartDate);
    const endDate = new Date(data.appointmentEndDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw { status: 400, message: 'Les dates ne sont pas valides.' };
    }
    if (startDate >= endDate) {
      throw { status: 400, message: 'La date de début doit être antérieure à la date de fin.' };
    }
    const now = new Date();
    if (startDate <= now || endDate <= now) {
      throw { status: 400, message: 'Les dates doivent être dans le futur.' };
    }

    const patient = await this.patientRepo.findById(data.patientId);
    if (!patient) throw { status: 404, message: "Le patient n'a pas été trouvé" };

    const professional = await this.professionalRepo.findByUserId(data.userId);
    if (!professional) throw { status: 404, message: 'Vous êtes pas un professionnel de santé' };

    const act = await this.actRepo.findById(professional.Id);
    if (!act) throw { status: 404, message: "L'acte n'a pas été trouvé" };

    const prescriptionAct = await this.prescriptionActRepo.findById(data.prescriptionHealthcareActId);
    if (!prescriptionAct) throw { status: 404, message: "L'acte de prescription est introuvable." };

    const hasActLink = await this.linkRepo.findOne(professional.Id, prescriptionAct.HealthcareActId);
    if (!hasActLink) {
      throw { status: 403, message: "Ce professionnel n'est pas autorisé à réaliser cet acte." };
    }

    const appointment = await this.appointmentRepo.create({
      PatientId: data.patientId,
      HealthcareProfessionalId: professional.Id,
      PrescriptionHealthcareActId: data.prescriptionHealthcareActId,
      Status: AppointmentsStatusEnum.PLANNED,
      AppointmentStartDate: data.appointmentStartDate,
      AppointmentEndDate: data.appointmentEndDate,
    });

    prescriptionAct.Status = PrescriptionHealthcareactsStatus.PLANNED;
    await prescriptionAct.save();

    return appointment;
  }
}
