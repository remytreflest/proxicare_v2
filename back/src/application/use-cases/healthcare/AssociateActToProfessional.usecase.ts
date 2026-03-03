import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';
import { IHealthcareProfessionalHealthcareActRepository } from '@/domain/repositories/IHealthcareProfessionalHealthcareActRepository';

export class AssociateActToProfessional {
  constructor(
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly actRepo: IHealthcareActRepository,
    private readonly linkRepo: IHealthcareProfessionalHealthcareActRepository,
  ) {}

  async execute(userId: string, healthcareActId: number): Promise<void> {
    const professional = await this.professionalRepo.findByUserId(userId);
    if (!professional) throw { status: 404, message: 'Le professionnel de soins est introuvable.' };

    const act = await this.actRepo.findById(healthcareActId);
    if (!act) throw { status: 404, message: 'Acte de soin introuvable.' };

    await this.linkRepo.create({
      HealthcareProfessionalId: professional.Id,
      HealthcareActId: healthcareActId,
    });
  }
}
