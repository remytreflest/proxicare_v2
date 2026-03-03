import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';

export class GetAllHealthcareActs {
  constructor(private readonly actRepo: IHealthcareActRepository) {}

  async execute(): Promise<HealthcareAct[]> {
    return this.actRepo.findAll();
  }
}
