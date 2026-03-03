import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';

export class DeleteAppointment {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly patientRepo: IPatientRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly appointmentRepo: IAppointmentRepository,
  ) {}

  async execute(appointmentId: number, userId: string): Promise<void> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) throw { status: 404, message: 'Rendez-vous introuvable ou non autorisé' };

    const user = await this.userRepo.findByIdOrNull(userId);
    if (!user) throw { status: 403, message: "Vous n'êtes pas un utilisateur de notre site" };

    const patient = await this.patientRepo.findByUserId(user.Id);
    const professional = await this.professionalRepo.findByUserId(user.Id);

    if (!patient && !professional) {
      throw { status: 403, message: "Vous n'êtes ni le patient ni le professionel de soins, il est impossible de supprimer ce rendez vous" };
    }

    await this.appointmentRepo.delete(appointment);
  }
}
