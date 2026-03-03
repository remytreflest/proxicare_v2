import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';

export class GetProfessionalsWithActs {
  constructor(private readonly professionalRepo: IHealthcareProfessionalRepository) {}

  async execute(): Promise<HealthcareProfessional[]> {
    return this.professionalRepo.findAllWithActs();
  }
}
