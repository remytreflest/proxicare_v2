import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';

export class GetProfessionalActs {
  constructor(private readonly professionalRepo: IHealthcareProfessionalRepository) {}

  async execute(userId: string): Promise<HealthcareAct[]> {
    const professional = await this.professionalRepo.findByUserIdWithActs(userId);
    if (!professional) throw { status: 404, message: 'Professionnel non trouvé.' };
    return professional.HealthcareActs ?? [];
  }
}
