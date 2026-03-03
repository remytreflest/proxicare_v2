import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import Appointment from '@/infrastructure/database/models/Appointment.model';

export class GetAppointments {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly patientRepo: IPatientRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(userId: string): Promise<Appointment[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw { status: 403, message: 'Utilisateur inconnu.' };

    const [patient, professional] = await Promise.all([
      this.patientRepo.findByUserId(user.Id),
      this.professionalRepo.findByUserId(user.Id),
    ]);

    if (!patient && !professional) {
      throw { status: 403, message: 'Aucun rendez-vous disponible pour cet utilisateur.' };
    }

    return this.appointmentRepo.findAllForUser(patient?.Id, professional?.Id);
  }
}
