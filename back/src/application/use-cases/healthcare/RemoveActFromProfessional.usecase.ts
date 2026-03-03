import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IHealthcareProfessionalHealthcareActRepository } from '@/domain/repositories/IHealthcareProfessionalHealthcareActRepository';

export class RemoveActFromProfessional {
  constructor(
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly linkRepo: IHealthcareProfessionalHealthcareActRepository,
  ) {}

  async execute(userId: string, actId: number): Promise<void> {
    const professional = await this.professionalRepo.findByUserId(userId);
    if (!professional) throw { status: 404, message: 'Professionnel non trouvé.' };

    const deleted = await this.linkRepo.delete(professional.Id, actId);
    if (deleted === 0) throw { status: 404, message: 'Acte introuvable ou déjà supprimé.' };
  }
}
